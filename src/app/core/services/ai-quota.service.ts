import { Injectable, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Respuesta de error de cuota Gemini
 */
export interface GeminiQuotaError {
  message: string;
  used: number;
  limit: number;
  reset_date: string;
}

/**
 * Tipos de error 429
 */
export type RateLimitType = 'quota_exceeded' | 'rate_limit' | 'unknown';

/**
 * Estado de la cuota de IA
 */
export interface AIQuotaState {
  isQuotaExceeded: boolean;
  quotaInfo: GeminiQuotaError | null;
  isRateLimited: boolean;
  rateLimitMessage: string | null;
  lastError: Date | null;
}

/**
 * AI Quota Service
 * ================
 *
 * Gestiona la cuota de consultas IA (Gemini) y los errores 429.
 *
 * Tipos de error 429:
 * 1. Cuota Gemini: Usuario agotó sus 20 consultas IA mensuales
 *    - detail: { message, used, limit, reset_date }
 * 2. Rate limit IP: Demasiadas requests en poco tiempo
 *    - detail: "Demasiadas peticiones. Reintente en X segundos."
 */
@Injectable({
  providedIn: 'root'
})
export class AIQuotaService {

  // Lista de endpoints protegidos por cuota Gemini
  private readonly GEMINI_ENDPOINTS = [
    '/api/upload/',
    '/api/insights/generate',
    '/api/insights/financial-health',
    '/api/insights/recommendations',
    '/api/insights/monthly-outlook',
    '/api/insights/savings-plan',
    '/api/insights/custom-analysis',
    '/api/insights/dashboard',
    '/api/insights/chat',
    '/api/health/financial-report'
  ];

  // State signals
  private _quotaState = signal<AIQuotaState>({
    isQuotaExceeded: false,
    quotaInfo: null,
    isRateLimited: false,
    rateLimitMessage: null,
    lastError: null
  });

  // Public readonly signals
  public readonly quotaState = this._quotaState.asReadonly();

  // Computed signals
  public readonly isQuotaExceeded = computed(() => this._quotaState().isQuotaExceeded);
  public readonly isRateLimited = computed(() => this._quotaState().isRateLimited);
  public readonly hasAnyLimit = computed(() =>
    this._quotaState().isQuotaExceeded || this._quotaState().isRateLimited
  );
  public readonly quotaInfo = computed(() => this._quotaState().quotaInfo);

  /**
   * Verifica si una URL es un endpoint protegido por Gemini
   */
  isGeminiEndpoint(url: string): boolean {
    return this.GEMINI_ENDPOINTS.some(endpoint => url.includes(endpoint));
  }

  /**
   * Procesa un error 429 y actualiza el estado
   */
  handle429Error(error: HttpErrorResponse, url: string): RateLimitType {
    if (error.status !== 429) return 'unknown';

    const detail = error.error?.detail;

    // Tipo 1: Cuota Gemini agotada (objeto con message, used, limit, reset_date)
    if (detail && typeof detail === 'object' && 'used' in detail && 'limit' in detail) {
      const quotaError: GeminiQuotaError = {
        message: detail.message || 'Cuota de IA agotada',
        used: detail.used,
        limit: detail.limit,
        reset_date: detail.reset_date
      };

      this._quotaState.update(state => ({
        ...state,
        isQuotaExceeded: true,
        quotaInfo: quotaError,
        lastError: new Date()
      }));

      return 'quota_exceeded';
    }

    // Tipo 2: Rate limit IP (string con mensaje)
    if (detail && typeof detail === 'string') {
      this._quotaState.update(state => ({
        ...state,
        isRateLimited: true,
        rateLimitMessage: detail,
        lastError: new Date()
      }));

      // Auto-limpiar rate limit después de 60 segundos
      setTimeout(() => this.clearRateLimit(), 60000);

      return 'rate_limit';
    }

    return 'unknown';
  }

  /**
   * Obtiene un mensaje amigable para el usuario según el tipo de error
   */
  getUserFriendlyMessage(type: RateLimitType): string {
    const state = this._quotaState();

    switch (type) {
      case 'quota_exceeded':
        if (state.quotaInfo) {
          const resetDate = new Date(state.quotaInfo.reset_date);
          const formattedDate = resetDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long'
          });
          return `Has alcanzado el límite de ${state.quotaInfo.limit} consultas de IA este mes. ` +
                 `Tu cuota se renovará el ${formattedDate}.`;
        }
        return 'Has alcanzado el límite de consultas de IA este mes.';

      case 'rate_limit':
        return state.rateLimitMessage ||
               'Demasiadas peticiones. Por favor, espera unos segundos antes de intentarlo de nuevo.';

      default:
        return 'Error de límite de peticiones. Por favor, intenta más tarde.';
    }
  }

  /**
   * Obtiene información detallada de la cuota para mostrar en UI
   */
  getQuotaDisplayInfo(): { used: number; limit: number; remaining: number; resetDate: string } | null {
    const info = this._quotaState().quotaInfo;
    if (!info) return null;

    return {
      used: info.used,
      limit: info.limit,
      remaining: Math.max(0, info.limit - info.used),
      resetDate: new Date(info.reset_date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  }

  /**
   * Limpia el estado de rate limit
   */
  clearRateLimit(): void {
    this._quotaState.update(state => ({
      ...state,
      isRateLimited: false,
      rateLimitMessage: null
    }));
  }

  /**
   * Limpia todo el estado de cuota (útil para logout)
   */
  clearAll(): void {
    this._quotaState.set({
      isQuotaExceeded: false,
      quotaInfo: null,
      isRateLimited: false,
      rateLimitMessage: null,
      lastError: null
    });
  }

  /**
   * Verifica si se puede hacer una petición a un endpoint de IA
   */
  canMakeAIRequest(): boolean {
    const state = this._quotaState();
    return !state.isQuotaExceeded && !state.isRateLimited;
  }
}
