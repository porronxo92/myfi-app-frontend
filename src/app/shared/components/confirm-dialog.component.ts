import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Modal de confirmación reutilizable
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="icon-container" [class.danger]="type === 'danger'">
            <svg *ngIf="type === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <svg *ngIf="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 class="modal-title">{{ title }}</h2>
          <button class="close-button" (click)="onCancel()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="message">{{ message }}</p>
          <p class="submessage" *ngIf="submessage">{{ submessage }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button
            class="btn btn-primary"
            [class.btn-danger]="type === 'danger'"
            (click)="onConfirm()"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========================================
       CONFIRM DIALOG - INSTITUTIONAL
       ======================================== */

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: var(--space-4);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      max-width: 480px;
      width: 100%;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      padding: var(--space-6);
      padding-bottom: var(--space-4);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
    }

    .icon-container {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
      background: rgba(234, 179, 8, 0.1);
      color: var(--color-warning);
    }

    .icon-container.danger {
      background: rgba(202, 53, 33, 0.1);
      color: var(--color-negative);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .close-button {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      background: transparent;
      border: none;
      color: var(--text-faint);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      background: var(--bg-hover);
      color: var(--text-muted);
    }

    .modal-body {
      padding: 0 var(--space-6) var(--space-6);
      text-align: center;
    }

    .message {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0 0 var(--space-2) 0;
      line-height: 1.5;
    }

    .submessage {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    .modal-footer {
      padding: var(--space-4) var(--space-6) var(--space-6);
      display: flex;
      gap: var(--space-3);
      justify-content: center;
    }

    .btn {
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
      flex: 1;
      max-width: 150px;
    }

    .btn-secondary {
      background: var(--bg-hover);
      color: var(--text-primary);
      border: var(--border-default);
    }

    .btn-secondary:hover {
      background: var(--bg-elevated);
      border-color: var(--color-slate-400);
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);
    }

    .btn-primary:hover {
      background: var(--color-accent-hover);
    }

    .btn-danger {
      background: var(--color-negative);
      color: white;
    }

    .btn-danger:hover {
      background: rgb(180, 40, 25);
    }

    @media (max-width: 480px) {
      .modal-content {
        margin: var(--space-4);
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: var(--space-4);
        padding-right: var(--space-4);
      }

      .btn {
        max-width: none;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirmar acción';
  @Input() message: string = '¿Estás seguro de que deseas continuar?';
  @Input() submessage: string = '';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() type: 'warning' | 'danger' = 'warning';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
