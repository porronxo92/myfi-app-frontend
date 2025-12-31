import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Interceptor de Autenticación (Functional Interceptor - Angular 21)
 * 
 * RESPONSABILIDADES:
 * 1. Añade Authorization header con el access_token de localStorage
 * 2. Si recibe 401 (Unauthorized), intenta renovar token automáticamente
 * 3. Si el refresh falla, cierra sesión y redirige a login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Obtener token de localStorage
  const token = authService.getAccessToken();

  // Clonar request y añadir Authorization header si hay token
  let authReq = req;
  if (token && !isPublicEndpoint(req.url)) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Enviar petición
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // No intentar renovar token en endpoints públicos
      if (isPublicEndpoint(req.url)) {
        return throwError(() => error);
      }

      // Si es 401 (Unauthorized) en un endpoint PROTEGIDO, intentar renovar token
      if (error.status === 401) {
        console.warn('⚠️ Token expirado (401), intentando renovar...');
        
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Token renovado, reintentar petición original con nuevo token
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Refresh falló, cerrar sesión
            console.error('❌ Refresh token falló, cerrando sesión');
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Para otros errores, simplemente propagarlos
      return throwError(() => error);
    })
  );
};

/**
 * Determina si un endpoint es público (no requiere autenticación)
 * 
 * CRÍTICO: Usar endsWith() para evitar falsos positivos
 */
function isPublicEndpoint(url: string): boolean {
  const publicPaths = [
    '/api/users/login',
    '/api/users/register',
    '/api/users/refresh',
    '/health'
  ];

  // Verificar si la URL termina exactamente en alguno de estos paths
  return publicPaths.some(path => url.endsWith(path));
}
