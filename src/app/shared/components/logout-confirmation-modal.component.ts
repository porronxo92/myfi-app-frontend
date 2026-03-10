import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="icon-container">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <h2 class="modal-title">¿Cerrar sesión?</h2>
          <p class="modal-description">
            ¿Estás seguro de que deseas cerrar sesión? Se cerrará tu sesión actual.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="onCancel()">
            Cancelar
          </button>
          <button class="btn-danger" (click)="onConfirm()">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========================================
       LOGOUT MODAL - INSTITUTIONAL DESIGN
       ======================================== */
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(11, 17, 32, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      width: 100%;
      max-width: 420px;
      animation: slideUp 0.2s ease-out;
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(16px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      padding: var(--space-6);
      text-align: center;
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      margin: 0 auto var(--space-4);
      background: rgba(202, 53, 33, 0.1);
      border-radius: var(--radius-md);
      color: var(--color-negative);
    }

    .icon-container svg {
      width: 28px;
      height: 28px;
    }

    .modal-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--space-2);
      letter-spacing: var(--tracking-wide);
    }

    .modal-description {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.6;
    }

    .modal-footer {
      padding: var(--space-5) var(--space-6);
      border-top: var(--border-subtle);
      background: var(--bg-elevated);
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
    }

    .btn-secondary,
    .btn-danger {
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
      font-size: 0.8125rem;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-muted);
      border: var(--border-subtle);
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .btn-danger {
      background: var(--color-negative);
      color: white;
    }

    .btn-danger:hover {
      filter: brightness(1.1);
    }

    @media (max-width: 768px) {
      .modal-footer {
        flex-direction: column;
      }

      .btn-secondary,
      .btn-danger {
        width: 100%;
      }
    }
  `]
})
export class LogoutConfirmationModalComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
