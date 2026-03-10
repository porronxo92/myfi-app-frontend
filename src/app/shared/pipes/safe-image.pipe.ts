import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Pipe para asegurar que las imágenes base64 tengan el formato correcto
 * 
 * Uso: <img [src]="userProfile()!.profile_picture | safeImage" alt="Profile">
 * 
 * Maneja:
 * - Base64 puro: "iVBORw0KGgo..." → "data:image/jpeg;base64,iVBORw0KGgo..."
 * - Data URL completa: "data:image/jpeg;base64,iVBORw0..." → sin cambios
 * - URLs normales: "https://..." → sin cambios
 * - Valores vacíos/null → null
 */
@Pipe({
  name: 'safeImage',
  standalone: true
})
export class SafeImagePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeUrl | null {
    if (!value) {
      return null;
    }

    // Si ya es una data URL completa, devolverla tal cual
    if (value.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(value);
    }

    // Si es una URL HTTP, devolverla tal cual
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return this.sanitizer.bypassSecurityTrustUrl(value);
    }

    // Detectar base64 JPEG (/9j/) o PNG (iVBOR) - ANTES del check de '/'
    // El base64 de JPEG empieza con /9j/ que se confunde con rutas relativas
    if (value.startsWith('/9j/') || value.startsWith('iVBOR')) {
      const dataUrl = `data:image/jpeg;base64,${value}`;
      return this.sanitizer.bypassSecurityTrustUrl(dataUrl);
    }

    // Si es una ruta relativa del servidor (ej: /assets/...)
    if (value.startsWith('/')) {
      return this.sanitizer.bypassSecurityTrustUrl(value);
    }

    // Si es base64 puro (sin prefijo), agregarlo
    // Detectar si parece ser base64 válido (solo caracteres base64)
    if (/^[A-Za-z0-9+/=]+$/.test(value.substring(0, 100)) && value.length > 100) {
      // Asumir JPEG por defecto (el formato más común y el que usamos en la compresión)
      const dataUrl = `data:image/jpeg;base64,${value}`;
      return this.sanitizer.bypassSecurityTrustUrl(dataUrl);
    }

    // Si no es base64 reconocible, devolver null para evitar errores
    return null;
  }
}
