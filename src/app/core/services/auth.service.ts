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
   * Formatea una imagen de perfil para asegurar que tenga el prefijo correcto
   * Previene el Error 431 que ocurre cuando el navegador intenta cargar
   * una cadena base64 pura como URL relativa
   */
  private formatProfilePicture(picture: string | undefined): string | undefined {
    if (!picture) {
      return picture;
    }

    // Si ya tiene el prefijo correcto de data URL, devolverlo tal cual
    if (picture.startsWith('data:')) {
      return picture;
    }

    // Si es una URL HTTP, devolverla tal cual
    if (picture.startsWith('http://') || picture.startsWith('https://')) {
      return picture;
    }

    // Detectar base64 JPEG (empieza con /9j/) o PNG (empieza con iVBOR)
    // IMPORTANTE: esto debe ir ANTES del check de '/' para rutas relativas
    if (picture.startsWith('/9j/') || picture.startsWith('iVBOR')) {
      return `data:image/jpeg;base64,${picture}`;
    }

    // Si es una ruta relativa del servidor (ej: /assets/...)
    if (picture.startsWith('/')) {
      return picture;
    }

    // Si parece base64 puro (solo caracteres válidos), agregar el prefijo
    if (/^[A-Za-z0-9+/=]+$/.test(picture.substring(0, 100)) && picture.length > 100) {
      return `data:image/jpeg;base64,${picture}`;
    }

    return picture;
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
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<TokenResponse>(
      `${environment.apiUrl}/users/refresh`,
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => {
        this.handleAuthenticationSuccess(response);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * LOGOUT - Cerrar sesión
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
  }

  /**
   * VERIFICAR SI HAY SESIÓN ACTIVA
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
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Manejar respuesta exitosa de login/registro
   */
  private handleAuthenticationSuccess(response: TokenResponse): void {
    // Guardar tokens en localStorage
    localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
    localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
    
    // Formatear la imagen antes de guardar
    if (response.user.profile_picture) {
      response.user.profile_picture = this.formatProfilePicture(response.user.profile_picture);
    }
    
    // Guardar usuario en localStorage
    this.setUser(response.user);

    // Actualizar signals
    this.userSignal.set(response.user);
    this.isAuthenticatedSignal.set(true);
    this.updateAuthenticationState();
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
   */
  private loadFromStorage(): void {
    const user = this.getUserFromStorage();
    const hasTokens = this.hasValidSession();

    if (user && hasTokens) {
      // Formatear la imagen antes de asignar al signal
      if (user.profile_picture) {
        user.profile_picture = this.formatProfilePicture(user.profile_picture);
      }
      
      this.userSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  /**
   * Actualizar datos del usuario en el estado
   * (Útil después de actualizar perfil)
   */
  updateUserProfile(updatedUser: Partial<User>): void {
    const currentUser = this.userSignal();
    if (currentUser) {
      // Formatear la imagen si viene en la actualización
      if (updatedUser.profile_picture) {
        updatedUser.profile_picture = this.formatProfilePicture(updatedUser.profile_picture);
      }
      
      const mergedUser = { ...currentUser, ...updatedUser };
      this.userSignal.set(mergedUser);
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(mergedUser));
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

    return throwError(() => new Error(errorMessage));
  }
}
