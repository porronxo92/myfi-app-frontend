import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../core/services/upload.service';

/**
 * Componente reutilizable para carga de archivos con drag & drop
 * 
 * Características:
 * - Zona drag & drop
 * - Botón de selección de archivo
 * - Validación automática de tamaño y extensión
 * - Feedback visual inmediato
 */
@Component({
  selector: 'app-file-upload-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="upload-zone"
      [class.drag-over]="isDragging()"
      [class.has-file]="selectedFile()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <input 
        #fileInput
        type="file"
        class="file-input"
        accept=".pdf,.csv,.xlsx,.txt"
        (change)="onFileSelected($event)"
      />

      <!-- Sin archivo seleccionado -->
      <div class="upload-content" *ngIf="!selectedFile()">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        <h3 class="upload-title">Sube tu extracto bancario</h3>
        <p class="upload-description">
          Arrastra el archivo aquí o haz clic para seleccionar
        </p>
        <button 
          type="button"
          class="btn-select-file"
          (click)="fileInput.click()"
        >
          Seleccionar archivo
        </button>
        <p class="upload-info">
          <span>Formatos permitidos: PDF, CSV, XLSX, TXT</span>
          <span>Tamaño máximo: 10 MB</span>
        </p>
      </div>

      <!-- Archivo seleccionado -->
      <div class="file-selected" *ngIf="selectedFile() && !error()">
        <svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <div class="file-info">
          <p class="file-name">{{ selectedFile()?.name }}</p>
          <p class="file-size">{{ fileSize() }}</p>
        </div>
        <button 
          type="button"
          class="btn-remove"
          (click)="removeFile()"
          title="Eliminar archivo"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Error -->
      <div class="upload-error" *ngIf="error()">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="error-message">{{ error() }}</p>
        <button 
          type="button"
          class="btn-try-again"
          (click)="removeFile(); fileInput.click()"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      background: #f8fafc;
      transition: all 0.3s;
      cursor: pointer;
      position: relative;
    }

    .upload-zone.drag-over {
      border-color: #3b82f6;
      background: #eff6ff;
      transform: scale(1.02);
    }

    .upload-zone.has-file {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .file-input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .upload-icon {
      width: 64px;
      height: 64px;
      color: #94a3b8;
    }

    .upload-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }

    .upload-description {
      color: #64748b;
      margin: 0;
    }

    .btn-select-file {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 0.5rem;
    }

    .btn-select-file:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .upload-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #94a3b8;
      margin-top: 0.5rem;
    }

    .file-selected {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
    }

    .file-icon {
      width: 48px;
      height: 48px;
      color: #10b981;
      flex-shrink: 0;
    }

    .file-info {
      flex: 1;
      text-align: left;
    }

    .file-name {
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
      word-break: break-all;
    }

    .file-size {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }

    .btn-remove {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-remove:hover {
      background: #fecaca;
    }

    .upload-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .error-icon {
      width: 48px;
      height: 48px;
      color: #dc2626;
    }

    .error-message {
      color: #dc2626;
      font-weight: 500;
      margin: 0;
    }

    .btn-try-again {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-try-again:hover {
      background: #b91c1c;
    }
  `]
})
export class FileUploadZoneComponent {
  // Signals
  isDragging = signal<boolean>(false);
  selectedFile = signal<File | null>(null);
  fileSize = signal<string>('');
  error = signal<string | null>(null);

  // Outputs
  fileSelected = output<File>();

  constructor(private uploadService: UploadService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Validar archivo
    const validation = this.uploadService.validateFile(file);
    
    if (!validation.valid) {
      this.error.set(validation.error || 'Archivo no válido');
      this.selectedFile.set(null);
      return;
    }

    // Archivo válido
    this.error.set(null);
    this.selectedFile.set(file);
    this.fileSize.set(this.uploadService.formatFileSize(file.size));
    
    // Emitir evento
    this.fileSelected.emit(file);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.fileSize.set('');
    this.error.set(null);
  }
}
