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
 * Para endpoints con query params, usar includes()
 */
function isPublicEndpoint(url: string): boolean {
  const publicPathsExact = [
    '/api/users/login',
    '/api/users/register',
    '/api/users/refresh',
    '/api/users/forgot-password',
    '/api/users/reset-password',
    '/health'
  ];

  // Endpoints que pueden tener query params
  const publicPathsContains = [
    '/api/users/verify-reset-token'
  ];

  // Verificar si la URL termina exactamente en alguno de estos paths
  const isExactMatch = publicPathsExact.some(path => url.endsWith(path));

  // Verificar si la URL contiene alguno de estos paths (para query params)
  const isContainsMatch = publicPathsContains.some(path => url.includes(path));

  return isExactMatch || isContainsMatch;
}
