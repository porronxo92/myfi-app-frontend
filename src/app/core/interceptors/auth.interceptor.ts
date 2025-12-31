import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Interceptor de Autenticación (Functional Interceptor - Angular 21)
 * 
 * RESPONSABILIDADES (MIGRACIÓN A COOKIES HTTP-ONLY):
 * 1. Añade withCredentials: true a TODAS las peticiones (envía cookies automáticamente)
 * 2. Ya NO añade header Authorization manualmente (los tokens están en cookies)
 * 3. Si recibe 401 (Unauthorized), intenta renovar token automáticamente
 * 4. Si el refresh falla, cierra sesión y redirige a login
 * 
 * IMPORTANTE: Con cookies HTTP-only, el token se envía automáticamente en cada petición
 * sin necesidad de añadir headers manualmente desde JavaScript
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // DEBUG: Log para diagnóstico
  console.log(`🔍 Interceptor procesando: ${req.method} ${req.url}`);
  console.log(`   Es endpoint público: ${isPublicEndpoint(req.url) ? 'SÍ' : 'NO'}`);
  console.log(`   WithCredentials: Las cookies se envían automáticamente`);

  // CRÍTICO: Añadir withCredentials a TODAS las peticiones
  // Esto permite que el navegador envíe/reciba cookies HTTP-only automáticamente
  const authReq = req.clone({
    withCredentials: true  // ← El navegador enviará las cookies automáticamente
  });

  console.log(`✅ WithCredentials añadido - Cookies HTTP-only se enviarán automáticamente`);

  // Enviar petición
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // IMPORTANTE: No intentar renovar token en endpoints públicos (login, register)
      // Estos endpoints NO requieren autenticación, así que un 401 significa credenciales incorrectas
      const isPublicEndpoint = req.url.includes('/users/login') || 
                               req.url.includes('/users/register') || 
                               req.url.includes('/users/refresh');

      if (isPublicEndpoint) {
        console.log(`⚠️ Error ${error.status} en endpoint público ${req.url} - Propagando error sin reintentar`);
        return throwError(() => error);
      }

      // Si es 401 (Unauthorized) en un endpoint PROTEGIDO, intentar renovar token
      if (error.status === 401) {
        console.warn('⚠️ Token expirado (401) en endpoint protegido, intentando renovar...');
        
        // Intentar renovar token (el refresh_token se envía automáticamente en cookie)
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Token renovado exitosamente, reintentar petición original
            console.log('✅ Token renovado, reintentando petición original');
            // La cookie ya se actualizó automáticamente, solo reintentar
            return next(authReq);
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
