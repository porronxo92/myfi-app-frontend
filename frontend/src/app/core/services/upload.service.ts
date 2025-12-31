import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadResponse } from '../models/upload.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de carga y procesamiento de extractos bancarios
 * 
 * Integración con endpoint: POST /api/upload/
 */
@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient) {}

  /**
   * Sube un archivo de extracto bancario para procesamiento con IA
   * 
   * @param file - Archivo PDF, CSV, XLSX o TXT
   * @returns Observable con la respuesta estructurada de la IA
   */
  uploadStatement(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('fichero', file);

    return this.http.post<UploadResponse>(
      `${environment.apiUrl}/upload/`,
      formData,
      { 
        withCredentials: true  // Envía cookies HTTP-only con JWT
      }
    );
  }

  /**
   * Valida el archivo antes de subirlo
   * 
   * @param file - Archivo a validar
   * @returns Objeto con resultado de validación
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedExtensions = ['pdf', 'csv', 'xlsx', 'txt'];
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Formato no permitido. Extensiones permitidas: ${allowedExtensions.join(', ')}`
      };
    }

    // Validar tamaño
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Formatea el tamaño del archivo para mostrarlo al usuario
   * 
   * @param bytes - Tamaño en bytes
   * @returns String formateado (ej: "2.5 MB")
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
