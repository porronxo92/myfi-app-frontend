import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-account-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Nueva Cuenta Bancaria</h2>
          <button class="close-button" (click)="close()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <!-- Nombre de la cuenta -->
            <div class="form-group">
              <label class="form-label">Nombre de la cuenta *</label>
              <input 
                type="text" 
                class="form-input" 
                formControlName="name"
                placeholder="Ej: Cuenta Nómina"
              />
              <div class="error-message" *ngIf="accountForm.get('name')?.invalid && accountForm.get('name')?.touched">
                El nombre es requerido
              </div>
            </div>

            <!-- Tipo de cuenta -->
            <div class="form-group">
              <label class="form-label">Tipo de cuenta *</label>
              <select class="form-select" formControlName="type">
                <option value="checking">Cuenta Corriente</option>
                <option value="savings">Cuenta de Ahorro</option>
                <option value="investment">Inversión</option>
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="cash">Efectivo</option>
              </select>
              <div class="error-message" *ngIf="accountForm.get('type')?.invalid && accountForm.get('type')?.touched">
                El tipo de cuenta es requerido
              </div>
            </div>

            <!-- Banco -->
            <div class="form-group">
              <label class="form-label">Banco *</label>
              <select class="form-select" formControlName="bank_name">
                <option *ngFor="let bank of banks" [value]="bank">{{ bank }}</option>
              </select>
              <div class="error-message" *ngIf="accountForm.get('bank_name')?.invalid && accountForm.get('bank_name')?.touched">
                El banco es requerido
              </div>
            </div>

            <!-- Número de cuenta / IBAN -->
            <div class="form-group">
              <label class="form-label">Número de cuenta / IBAN</label>
              <input 
                type="text" 
                class="form-input" 
                formControlName="account_number"
                placeholder="ES00 0000 0000 0000 0000 0000"
                maxlength="24"
              />
            </div>

            <!-- Balance inicial -->
            <div class="form-group">
              <label class="form-label">Balance inicial *</label>
              <div class="input-with-icon">
                <span class="input-icon">€</span>
                <input 
                  type="number" 
                  class="form-input with-icon" 
                  formControlName="balance"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div class="error-message" *ngIf="accountForm.get('balance')?.invalid && accountForm.get('balance')?.touched">
                El balance inicial es requerido
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="close()">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" [disabled]="accountForm.invalid || isSubmitting()">
              <span *ngIf="!isSubmitting()">Crear cuenta</span>
              <span *ngIf="isSubmitting()">Creando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* ========================================
       ADD ACCOUNT MODAL - INSTITUTIONAL
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
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-5) var(--space-6);
      border-bottom: var(--border-subtle);
    }

    .modal-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: var(--tracking-wide);
    }

    .close-button {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .close-button:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .modal-body {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .form-label {
      font-weight: 600;
      color: var(--text-muted);
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input,
    .form-select {
      padding: var(--space-3) var(--space-4);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      color: var(--text-primary);
      transition: all var(--transition-fast);
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px var(--color-accent-subtle);
    }

    .form-input::placeholder {
      color: var(--text-faint);
    }

    .form-input[type="number"] {
      font-family: var(--font-data);
    }

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394A3B8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right var(--space-3) center;
      cursor: pointer;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: var(--space-4);
      color: var(--text-muted);
      font-family: var(--font-data);
      font-weight: 600;
      font-size: 0.9375rem;
      pointer-events: none;
    }

    .form-input.with-icon {
      padding-left: var(--space-10);
      font-family: var(--font-data);
    }

    .error-message {
      color: var(--color-negative);
      font-size: 0.75rem;
      margin-top: var(--space-1);
    }

    .modal-footer {
      padding: var(--space-5) var(--space-6);
      border-top: var(--border-subtle);
      background: var(--bg-elevated);
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
    }

    .btn-primary,
    .btn-secondary {
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
      font-size: 0.8125rem;
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    @media (max-width: 768px) {
      .modal-content {
        max-height: 95vh;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: var(--space-5);
        padding-right: var(--space-5);
      }

      .modal-footer {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class AddAccountModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() accountCreated = new EventEmitter<any>();

  isSubmitting = signal(false);

  banks = [
    'Abanca',
    'Andbank España',
    'BBVA',
    'Banco Sabadell',
    'Banco Santander',
    'Bankinter',
    'BNP Paribas España',
    'CaixaBank',
    'Citibank España',
    'Deutsche Bank España',
    'Evo Banco',
    'HSBC Bank España',
    'Ibercaja Banco',
    'Interactive Brokers',
    'Kutxabank',
    'MyInvestor',
    'Openbank',
    'Renta 4 Banco',
    'Triodos Bank',
    'Unicaja Banco', 
    'Revolut', 
    'Rand'
  ];

  accountForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      bank_name: ['', [Validators.required]],
      account_number: [''],
      balance: [0, [Validators.required]]
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.isSubmitting.set(true);
      
      const accountData = {
        ...this.accountForm.value,
        is_active: true
      };

      // Emitir el evento con los datos de la cuenta
      this.accountCreated.emit(accountData);
    }
  }
}
