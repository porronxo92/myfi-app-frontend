import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  RefreshTokenRequest,
  AuthState
} from '../models/user.model';
import { environment } from '../../../environments/environment';
import { SecurityConfigService } from './security-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // NOTA: Ya NO usamos localStorage para tokens (migración a cookies HTTP-only)
  // Solo guardamos el usuario en localStorage para datos no sensibles
  private readonly STORAGE_KEYS = {
    USER: 'user'
  };

  // Signals para estado reactivo (Angular 21)
  private userSignal = signal<User | null>(this.getUserFromStorage());
  private isAuthenticatedSignal = signal<boolean>(false);
  
  // Computed signals (derivados)
  public readonly user = this.userSignal.asReadonly();
  public readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  
  // BehaviorSubject para compatibilidad con RxJS (guards, interceptores)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private securityConfig: SecurityConfigService
  ) {
    // Log de configuración de seguridad al inicializar
    this.securityConfig.logSecurityContext();
    
    // Cargar datos de localStorage al inicializar
    this.loadFromStorage();
    // Sincronizar BehaviorSubject con signal
    this.updateAuthenticationState();
  }

  /**
   * LOGIN - Autenticar usuario
   * POST /api/users/login
   * 
   * IMPORTANTE: Con withCredentials: true, las cookies HTTP-only se reciben automáticamente
   */
  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${environment.apiUrl}/users/login`,
      credentials,
      { withCredentials: true }  // ← Permite recibir cookies HTTP-only del backend
    ).pipe(
      tap(response => this.handleAuthenticationSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * REGISTRO - Crear nuevo usuario
   * POST /api/users/
   */
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(
      `${environment.apiUrl}/users/`,
      data
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * REFRESH TOKEN - Renovar access token
   * POST /api/users/refresh
   * 
   * IMPORTANTE: El refresh_token se envía automáticamente en la cookie HTTP-only
   */
  refreshToken(): Observable<TokenResponse> {
    // Ya NO necesitamos obtener el refresh_token de localStorage
    // Se envía automáticamente en la cookie con withCredentials: true

    return this.http.post<TokenResponse>(
      `${environment.apiUrl}/users/refresh`,
      {},  // Body vacío, el token viene en cookie
      { withCredentials: true }
    ).pipe(
      tap(response => {
        // Actualizar solo usuario, los tokens vienen en cookies
        this.setUser(response.user);
        this.isAuthenticatedSignal.set(true);
        console.log('✅ Token renovado automáticamente (cookies HTTP-only)');
      }),
      catchError(error => {
        console.error('❌ Error renovando token, cerrando sesión');
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * LOGOUT - Cerrar sesión
   * 
   * Llama al backend para limpiar cookies HTTP-only
   */
  logout(): void {
    // Limpiar localStorage (solo usuario, los tokens están en cookies)
    localStorage.removeItem(this.STORAGE_KEYS.USER);

    // Resetear signals
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.updateAuthenticationState();

    // Llamar al backend para limpiar cookies HTTP-only
    this.http.post(
      `${environment.apiUrl}/users/logout`, 
      {}, 
      { withCredentials: true }
    ).subscribe({
      next: () => {
        console.log('👋 Sesión cerrada - Cookies HTTP-only eliminadas por el backend');
      },
      error: (error) => {
        console.warn('⚠️ Error al limpiar cookies en backend (ignorando):', error);
      }
    });

    // Redirigir a login
    this.router.navigate(['/login']);
    console.log('👋 Sesión cerrada localmente');
  }

  /**
   * VERIFICAR SI HAY SESIÓN ACTIVA
   * 
   * NOTA: Ya no podemos verificar tokens desde JavaScript (están en cookies HTTP-only)
   * Confiamos en que el backend valide la cookie en cada petición
   */
  hasValidSession(): boolean {
    // Verificar si hay usuario cargado (indica que hubo login)
    return this.isAuthenticated();
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Manejar respuesta exitosa de login/registro
   * 
   * IMPORTANTE: Ya NO guardamos tokens en localStorage (están en cookies HTTP-only)
   */
  private handleAuthenticationSuccess(response: TokenResponse): void {
    console.log('🔍 Respuesta del backend:', response);
    console.log('🍪 Tokens recibidos en cookies HTTP-only (no accesibles desde JavaScript)');
    
    // Solo guardar usuario en localStorage (datos no sensibles)
    this.setUser(response.user);

    // Actualizar signals
    this.userSignal.set(response.user);
    this.isAuthenticatedSignal.set(true);
    this.updateAuthenticationState();

    // Verificar que se guardó el usuario
    console.log('💾 Verificando localStorage:');
    console.log('  - user guardado:', !!localStorage.getItem(this.STORAGE_KEYS.USER));
    console.log('  - tokens: En cookies HTTP-only (Secure, SameSite)');

    console.log('✅ Autenticación exitosa', {
      user: response.user.email,
      expires_in: `${response.expires_in / 60} minutos`,
      storage: 'HTTP-only Cookies'
    });
  }

  /**
   * Guardar usuario (datos no sensibles)
   */
  private setUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Obtener usuario de localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEYS.USER);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Actualizar estado de autenticación (BehaviorSubject)
   */
  private updateAuthenticationState(): void {
    this.isAuthenticatedSubject.next(this.isAuthenticated());
  }

  /**
   * Cargar datos de autenticación desde localStorage
   * 
   * NOTA: Solo cargamos el usuario, los tokens están en cookies HTTP-only
   */
  private loadFromStorage(): void {
    const user = this.getUserFromStorage();

    if (user) {
      this.userSignal.set(user);
      this.isAuthenticatedSignal.set(true);
      console.log('✅ Sesión restaurada desde localStorage:', user.email);
      console.log('   Tokens: En cookies HTTP-only (no accesibles desde JavaScript)');
    } else {
      console.log('ℹ️ No hay sesión guardada en localStorage');
    }
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 401) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.status === 422) {
        errorMessage = error.error?.detail || 'Datos inválidos';
      } else if (error.status === 429) {
        errorMessage = error.error?.detail || 'Demasiados intentos. Intenta más tarde';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor. Intenta más tarde';
      } else {
        errorMessage = error.error?.detail || `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('❌ Error HTTP:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
