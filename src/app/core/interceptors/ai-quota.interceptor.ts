import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AIQuotaService } from '../services/ai-quota.service';

/**
 * AI Quota Interceptor
 * ====================
 *
 * Intercepta errores 429 de los endpoints de Gemini y actualiza el AIQuotaService.
 *
 * Tipos de error 429:
 * 1. Cuota Gemini: detail = { message, used, limit, reset_date }
 * 2. Rate limit IP: detail = "Demasiadas peticiones. Reintente en X segundos."
 */
export const aiQuotaInterceptor: HttpInterceptorFn = (req, next) => {
  const aiQuotaService = inject(AIQuotaService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo procesar errores 429
      if (error.status === 429) {
        // Verificar si es un endpoint de Gemini
        if (aiQuotaService.isGeminiEndpoint(req.url)) {
          const errorType = aiQuotaService.handle429Error(error, req.url);

          // Crear un error enriquecido con información adicional
          const enrichedError = new HttpErrorResponse({
            error: {
              ...error.error,
              _aiQuotaType: errorType,
              _userMessage: aiQuotaService.getUserFriendlyMessage(errorType)
            },
            headers: error.headers,
            status: error.status,
            statusText: error.statusText,
            url: error.url || undefined
          });

          return throwError(() => enrichedError);
        }
      }

      // Para otros errores, simplemente propagarlos
      return throwError(() => error);
    })
  );
};
