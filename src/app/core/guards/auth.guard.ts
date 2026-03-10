import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de Autenticación (Functional Guard - Angular 21)
 * 
 * Protege rutas que requieren autenticación.
 * Si el usuario NO está autenticado, redirige a /login
 * 
 * Uso en app.routes.ts:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]  // ← Aquí
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidSession()) {
    return true;
  }

  // Guardar URL intentada para redirigir después del login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * Guard para rutas públicas (opcional)
 * 
 * Redirige a /dashboard si el usuario YA está autenticado
 * Útil para evitar que usuarios logueados vean el login
 * 
 * Uso:
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [publicGuard]  // ← Si está logueado, va a dashboard
 * }
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidSession()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
