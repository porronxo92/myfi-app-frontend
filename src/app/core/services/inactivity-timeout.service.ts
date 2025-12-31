import { Injectable, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Servicio para gestión de timeout por inactividad
 * 
 * Funcionalidades:
 * - Detecta inactividad del usuario (sin eventos de mouse, teclado, scroll, click)
 * - Muestra advertencia 30 segundos antes del logout
 * - Ejecuta logout automático tras 5 minutos de inactividad
 * - Reset automático del temporizador cuando hay actividad
 */
@Injectable({
  providedIn: 'root'
})
export class InactivityTimeoutService implements OnDestroy {
  // Configuración (en milisegundos)
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos
  private readonly WARNING_TIME = 30 * 1000; // 30 segundos antes
  
  // Signals para estado reactivo
  public showWarning = signal<boolean>(false);
  public remainingSeconds = signal<number>(30);
  
  // Subscriptions
  private activitySubscription?: Subscription;
  private timeoutTimer?: any;
  private warningTimer?: any;
  private countdownTimer?: any;
  
  // Estado
  private isMonitoring = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Inicia el monitoreo de inactividad
   * Se debe llamar cuando el usuario se autentique
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('⏱️ Monitoreo de inactividad ya está activo');
      return;
    }

    console.log('🚀 Iniciando monitoreo de inactividad (timeout: 5 minutos)');
    this.isMonitoring = true;
    
    // Eventos a monitorear
    const mouseMove$ = fromEvent(document, 'mousemove');
    const keyDown$ = fromEvent(document, 'keydown');
    const click$ = fromEvent(document, 'click');
    const scroll$ = fromEvent(document, 'scroll', { capture: true });
    const touchStart$ = fromEvent(document, 'touchstart');

    // Combinar todos los eventos y aplicar debounce
    const activity$ = merge(
      mouseMove$,
      keyDown$,
      click$,
      scroll$,
      touchStart$
    ).pipe(
      debounceTime(1000) // Solo procesar 1 evento por segundo
    );

    // Suscribirse a eventos de actividad
    this.activitySubscription = activity$.subscribe(() => {
      this.resetTimers();
    });

    // Iniciar temporizadores
    this.resetTimers();
  }

  /**
   * Detiene el monitoreo de inactividad
   * Se debe llamar cuando el usuario cierre sesión
   */
  stopMonitoring(): void {
    console.log('🛑 Deteniendo monitoreo de inactividad');
    
    this.isMonitoring = false;
    this.showWarning.set(false);
    
    // Limpiar subscriptions
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
      this.activitySubscription = undefined;
    }

    // Limpiar timers
    this.clearAllTimers();
  }

  /**
   * Resetea los temporizadores cuando hay actividad
   */
  private resetTimers(): void {
    // Si hay advertencia visible, ocultarla
    if (this.showWarning()) {
      this.showWarning.set(false);
      console.log('✅ Usuario activo de nuevo - Advertencia cancelada');
    }

    // Limpiar timers existentes
    this.clearAllTimers();

    // Iniciar timer de advertencia (4.5 minutos)
    this.warningTimer = setTimeout(() => {
      this.showWarningModal();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    // Iniciar timer de timeout (5 minutos)
    this.timeoutTimer = setTimeout(() => {
      this.performLogout();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Muestra el modal de advertencia
   */
  private showWarningModal(): void {
    console.warn('⚠️ Usuario inactivo - Mostrando advertencia de timeout');
    this.showWarning.set(true);
    this.remainingSeconds.set(30);

    // Iniciar countdown de 30 segundos
    this.startCountdown();
  }

  /**
   * Inicia el countdown de segundos restantes
   */
  private startCountdown(): void {
    this.countdownTimer = setInterval(() => {
      const current = this.remainingSeconds();
      
      if (current <= 1) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = undefined;
      } else {
        this.remainingSeconds.set(current - 1);
      }
    }, 1000);
  }

  /**
   * Ejecuta el logout por inactividad
   */
  private performLogout(): void {
    console.warn('⏱️ Timeout por inactividad - Cerrando sesión automáticamente');
    
    // Detener monitoreo
    this.stopMonitoring();
    
    // Ejecutar logout
    this.authService.logout();
    
    // Redirigir a login con mensaje
    this.router.navigate(['/login'], {
      queryParams: { 
        timeout: 'true',
        reason: 'inactivity' 
      }
    });
  }

  /**
   * Permite al usuario extender la sesión (cuando hace click en "Continuar conectado")
   */
  extendSession(): void {
    console.log('✅ Usuario extendió la sesión manualmente');
    this.resetTimers();
  }

  /**
   * Limpia todos los temporizadores
   */
  private clearAllTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
    }

    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = undefined;
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  /**
   * Cleanup cuando se destruye el servicio
   */
  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
