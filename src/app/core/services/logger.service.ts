import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Servicio centralizado de logging
 *
 * En producción: Deshabilita logs de consola para evitar exposición de información
 * En desarrollo: Permite todos los logs para debugging
 *
 * Uso:
 * - Inyectar LoggerService en lugar de usar console.log/error directamente
 * - logger.error('mensaje', error) en lugar de console.error('mensaje', error)
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private readonly isProduction = environment.production;

  /**
   * Log de información general (solo en desarrollo)
   */
  info(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log de advertencias (solo en desarrollo)
   */
  warn(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log de errores
   * En producción: Solo registra en servicio externo (si está configurado)
   * En desarrollo: Muestra en consola
   */
  error(message: string, error?: any): void {
    if (!this.isProduction) {
      console.error(`[ERROR] ${message}`, error || '');
    } else {
      // En producción, aquí se podría enviar a un servicio de monitoreo
      // como Sentry, LogRocket, etc.
      this.reportToExternalService(message, error);
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log de éxito/operación completada (solo en desarrollo)
   */
  success(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.log(`[SUCCESS] ✅ ${message}`, ...args);
    }
  }

  /**
   * Reportar errores a servicio externo en producción
   * Placeholder para integración con Sentry, LogRocket, etc.
   */
  private reportToExternalService(message: string, error?: any): void {
    // TODO: Integrar con servicio de monitoreo de errores
    // Ejemplo con Sentry:
    // Sentry.captureException(error, { extra: { message } });

    // Por ahora, no hacer nada en producción para evitar exponer información
    // pero mantener el error capturado para posible debugging del servidor
  }
}
