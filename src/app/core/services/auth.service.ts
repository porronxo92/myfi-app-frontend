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
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
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
    // Log de configuraciÃ³n de seguridad al inicializar
    this.securityConfig.logSecurityContext();
    
    // Cargar datos de localStorage al inicializar
    this.loadFromStorage();
    // Sincronizar BehaviorSubject con signal
    this.updateAuthenticationState();
  }

  /**
   * LOGIN - Autenticar usuario
   * POST /api/users/login
   */
  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${environment.apiUrl}/users/login`,
      credentials
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
   */
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.error('âŒ No hay refresh token disponible');
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<TokenResponse>(
      `${environment.apiUrl}/users/refresh`,
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => {
        this.handleAuthenticationSuccess(response);
        console.log('âœ… Token renovado automÃ¡ticamente');
      }),
      catchError(error => {
        console.error('âŒ Error renovando token, cerrando sesiÃ³n');
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * LOGOUT - Cerrar sesiÃ³n
   */
  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);

    // Resetear signals
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.updateAuthenticationState();

    // Redirigir a login
    this.router.navigate(['/login']);
    console.log('ðŸ‘‹ SesiÃ³n cerrada - localStorage limpiado');
  }

  /**
   * VERIFICAR SI HAY SESIÃ“N ACTIVA
   */
  hasValidSession(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  /**
   * Obtener access token de localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtener refresh token de localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
  }

  // ============================================
  // MÃ‰TODOS PRIVADOS
  // ============================================

  /**
   * Manejar respuesta exitosa de login/registro
   */
  private handleAuthenticationSuccess(response: TokenResponse): void {
    // Guardar tokens en localStorage
    localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
    localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
    
    // Guardar usuario en localStorage
    this.setUser(response.user);

    // Actualizar signals
    this.userSignal.set(response.user);
    this.isAuthenticatedSignal.set(true);
    this.updateAuthenticationState();

    console.log('âœ… AutenticaciÃ³n exitosa', {
      user: response.user.email,
      expires_in: `${response.expires_in / 60} minutos`,
      storage: 'localStorage'
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
   * Actualizar estado de autenticaciÃ³n (BehaviorSubject)
   */
  private updateAuthenticationState(): void {
    this.isAuthenticatedSubject.next(this.isAuthenticated());
  }

  /**
   * Cargar datos de autenticaciÃ³n desde localStorage
   */
  private loadFromStorage(): void {
    const user = this.getUserFromStorage();
    const hasTokens = this.hasValidSession();

    if (user && hasTokens) {
      this.userSignal.set(user);
      this.isAuthenticatedSignal.set(true);
      console.log('âœ… SesiÃ³n restaurada desde localStorage:', user.email);
    } else {
      console.log('â„¹ï¸ No hay sesiÃ³n guardada en localStorage');
    }
  }

  /**
   * Actualizar datos del usuario en el estado
   * (Ãštil despuÃ©s de actualizar perfil)
   */
  updateUserProfile(updatedUser: Partial<User>): void {
    const currentUser = this.userSignal();
    if (currentUser) {
      const mergedUser = { ...currentUser, ...updatedUser };
      this.userSignal.set(mergedUser);
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(mergedUser));
      console.log('âœ… Usuario actualizado en AuthService:', mergedUser);
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
        errorMessage = 'Email o contraseÃ±a incorrectos';
      } else if (error.status === 422) {
        errorMessage = error.error?.detail || 'Datos invÃ¡lidos';
      } else if (error.status === 429) {
        errorMessage = error.error?.detail || 'Demasiados intentos. Intenta mÃ¡s tarde';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor. Intenta mÃ¡s tarde';
      } else {
        errorMessage = error.error?.detail || `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('âŒ Error HTTP:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
