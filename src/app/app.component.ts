import { Component, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { InactivityTimeoutService } from './core/services/inactivity-timeout.service';
import { InactivityWarningModalComponent } from './shared/components/inactivity-warning-modal.component';

/**
 * Componente principal de la aplicación
 * 
 * Responsabilidades:
 * - Gestionar el router outlet
 * - Iniciar/detener monitoreo de inactividad según estado de autenticación
 * - Mostrar modal de advertencia de timeout
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    InactivityWarningModalComponent
  ],
  template: `
    <router-outlet></router-outlet>
    
    <!-- Modal de advertencia de timeout por inactividad -->
    <app-inactivity-warning-modal />
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Finanzas Personal - MVP';

  constructor(
    private authService: AuthService,
    private inactivityService: InactivityTimeoutService
  ) {
    // Monitorear cambios en el estado de autenticación
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      
      if (isAuthenticated) {
        console.log('✅ Usuario autenticado - Iniciando monitoreo de inactividad');
        this.inactivityService.startMonitoring();
      } else {
        console.log('🚫 Usuario no autenticado - Deteniendo monitoreo de inactividad');
        this.inactivityService.stopMonitoring();
      }
    });
  }

  ngOnInit(): void {
    // El monitoreo se inicia automáticamente mediante el effect cuando hay autenticación
    console.log('🚀 Aplicación iniciada - Sistema de seguridad activo');
  }
}
