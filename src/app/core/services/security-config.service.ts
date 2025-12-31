import { Injectable } from '@angular/core';

/**
 * Servicio para configuración de seguridad
 * 
 * Responsabilidades:
 * - Detectar si la aplicación corre en HTTP o HTTPS
 * - Proporcionar configuración de cookies según el contexto
 * - Determinar atributos de seguridad (Secure, SameSite)
 */
@Injectable({
  providedIn: 'root'
})
export class SecurityConfigService {
  
  /**
   * Verifica si la aplicación está corriendo en contexto seguro (HTTPS)
   * 
   * @returns true si es HTTPS, false si es HTTP (localhost)
   */
  isSecureContext(): boolean {
    return window.location.protocol === 'https:';
  }

  /**
   * Verifica si estamos en localhost
   */
  isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Obtiene la configuración recomendada para cookies según el entorno
   * 
   * NOTA: El atributo 'httpOnly' SOLO se puede configurar en el backend.
   * En el frontend solo configuramos 'withCredentials: true' para enviar/recibir cookies.
   */
  getCookieSecurityInfo(): CookieSecurityInfo {
    const isSecure = this.isSecureContext();
    const isLocal = this.isLocalhost();

    return {
      // En producción (HTTPS): secure=true
      // En desarrollo (localhost HTTP): secure=false
      shouldUseSecureAttribute: isSecure,
      
      // SameSite recomendado según contexto
      sameSite: isSecure ? 'strict' : 'lax',
      
      // Información del entorno
      environment: isLocal ? 'localhost' : (isSecure ? 'production-https' : 'production-http'),
      protocol: window.location.protocol,
      hostname: window.location.hostname
    };
  }

  /**
   * Log de información de seguridad para debugging
   */
  logSecurityContext(): void {
    const info = this.getCookieSecurityInfo();
    console.log('🔒 Security Context:', {
      protocol: info.protocol,
      hostname: info.hostname,
      environment: info.environment,
      secureAttribute: info.shouldUseSecureAttribute,
      sameSite: info.sameSite,
      recommendation: this.getSecurityRecommendation()
    });
  }

  /**
   * Obtiene recomendaciones de seguridad según el entorno
   */
  private getSecurityRecommendation(): string {
    if (this.isSecureContext()) {
      return '✅ Secure context (HTTPS). Cookies con Secure=true, HttpOnly=true, SameSite=strict';
    } else if (this.isLocalhost()) {
      return '⚠️ Development (localhost HTTP). Cookies con Secure=false, HttpOnly=true, SameSite=lax';
    } else {
      return '⛔ INSECURE: Production sin HTTPS. Migrar a HTTPS inmediatamente.';
    }
  }
}

/**
 * Interface para información de configuración de cookies
 */
export interface CookieSecurityInfo {
  shouldUseSecureAttribute: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  environment: 'localhost' | 'production-https' | 'production-http';
  protocol: string;
  hostname: string;
}
