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
              <label class="form-label">Número de cuenta / IBAN *</label>
              <input 
                type="text" 
                class="form-input" 
                formControlName="account_number"
                placeholder="ES00 0000 0000 0000 0000 0000"
                maxlength="24"
              />
              <div class="error-message" *ngIf="accountForm.get('account_number')?.invalid && accountForm.get('account_number')?.touched">
                El número de cuenta es requerido
              </div>
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
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideUp 0.3s ease-out;
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .close-button:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .modal-body {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-weight: 600;
      color: #334155;
      font-size: 0.875rem;
    }

    .form-input,
    .form-select {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      color: #0f172a;
      transition: all 0.2s;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input::placeholder {
      color: #94a3b8;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: #64748b;
      font-weight: 600;
      pointer-events: none;
    }

    .form-input.with-icon {
      padding-left: 2.5rem;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: -0.25rem;
    }

    .modal-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-size: 0.9375rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    @media (max-width: 768px) {
      .modal-content {
        max-height: 95vh;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
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
      account_number: ['', [Validators.required]],
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
