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
    /* ========================================
       FILE UPLOAD ZONE - INSTITUTIONAL
       ======================================== */

    .upload-zone {
      border: 2px dashed var(--color-slate-600);
      border-radius: var(--radius-lg);
      padding: var(--space-10) var(--space-6);
      text-align: center;
      background: var(--bg-elevated);
      transition: all var(--transition-fast);
      cursor: pointer;
      position: relative;
    }

    .upload-zone.drag-over {
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
      border-style: solid;
    }

    .upload-zone.has-file {
      border-color: var(--color-positive);
      background: rgba(34, 160, 107, 0.05);
      border-style: solid;
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
      gap: var(--space-4);
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      color: var(--text-faint);
    }

    .upload-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .upload-description {
      color: var(--text-muted);
      margin: 0;
      font-size: 0.8125rem;
    }

    .btn-select-file {
      background: var(--color-accent);
      color: var(--color-slate-950);
      border: none;
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-top: var(--space-2);
    }

    .btn-select-file:hover {
      background: var(--color-accent-hover);
    }

    .upload-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      font-size: 0.75rem;
      color: var(--text-faint);
      margin-top: var(--space-2);
    }

    .file-selected {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      border: var(--border-subtle);
    }

    .file-icon {
      width: 40px;
      height: 40px;
      color: var(--color-positive);
      flex-shrink: 0;
    }

    .file-info {
      flex: 1;
      text-align: left;
    }

    .file-name {
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--space-1) 0;
      font-size: 0.875rem;
      word-break: break-all;
    }

    .file-size {
      color: var(--text-muted);
      font-size: 0.75rem;
      margin: 0;
      font-family: var(--font-data);
    }

    .btn-remove {
      background: rgba(202, 53, 33, 0.1);
      color: var(--color-negative);
      border: none;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-remove:hover {
      background: rgba(202, 53, 33, 0.2);
    }

    .upload-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .error-icon {
      width: 40px;
      height: 40px;
      color: var(--color-negative);
    }

    .error-message {
      color: var(--color-negative);
      font-weight: 500;
      font-size: 0.875rem;
      margin: 0;
    }

    .btn-try-again {
      background: var(--color-negative);
      color: white;
      border: none;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-try-again:hover {
      background: #A82A1D;
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
