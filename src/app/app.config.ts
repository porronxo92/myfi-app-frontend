import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { corsInterceptor } from './core/interceptors/cors.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { aiQuotaInterceptor } from './core/interceptors/ai-quota.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      // El orden importa: CORS primero, luego Auth, luego AI Quota
      // corsInterceptor asegura withCredentials=true en todas las peticiones
      // authInterceptor agrega el Authorization header
      // aiQuotaInterceptor captura errores 429 de endpoints Gemini
      withInterceptors([corsInterceptor, authInterceptor, aiQuotaInterceptor])
    )
  ]
};
