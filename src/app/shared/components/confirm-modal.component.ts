import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ title() }}</h3>
          <button class="btn-close" (click)="onCancel()" aria-label="Cerrar">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="icon-container" [class]="type()">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" *ngIf="type() === 'warning'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" *ngIf="type() === 'danger'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          
          <p class="message">{{ message() }}</p>
          
          <p class="submessage" *ngIf="submessage()">{{ submessage() }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" (click)="onCancel()">
            {{ cancelText() }}
          </button>
          <button class="btn btn-confirm" [class]="type()" (click)="onConfirm()">
            {{ confirmText() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      color: #94a3b8;
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .modal-body {
      padding: 2rem 1.5rem;
      text-align: center;
    }

    .icon-container {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-container.warning {
      background: #fef3c7;
      color: #f59e0b;
    }

    .icon-container.danger {
      background: #fee2e2;
      color: #ef4444;
    }

    .message {
      font-size: 1rem;
      font-weight: 500;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .submessage {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .modal-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-confirm {
      color: white;
    }

    .btn-confirm.warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
    }

    .btn-confirm.warning:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
    }

    .btn-confirm.danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }

    .btn-confirm.danger:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
    }

    @media (max-width: 640px) {
      .modal-footer {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class ConfirmModalComponent {
  title = input<string>('Confirmar acción');
  message = input<string>('¿Estás seguro de que quieres continuar?');
  submessage = input<string>('');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');
  type = input<'warning' | 'danger'>('warning');

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
