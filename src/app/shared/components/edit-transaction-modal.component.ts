import { Component, inject, signal, computed, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { AccountService } from '../../core/services/account.service';
import { Transaction } from '../../core/models/transaction.model';
import { Category } from '../../core/models/category.model';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-edit-transaction-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Editar Transacción</h2>
          <button class="close-button" (click)="onCancel()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Loading state -->
        <div class="loading-container" *ngIf="loading()">
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="!loading()">
          <div class="modal-body">
            <!-- Tipo -->
            <div class="form-group">
              <label class="form-label">Tipo *</label>
              <div class="type-buttons">
                <button 
                  type="button"
                  class="type-btn"
                  [class.income]="form.get('type')?.value === 'income'"
                  [class.active]="form.get('type')?.value === 'income'"
                  (click)="setType('income')"
                >
                  Ingreso
                </button>
                <button 
                  type="button"
                  class="type-btn"
                  [class.expense]="form.get('type')?.value === 'expense'"
                  [class.active]="form.get('type')?.value === 'expense'"
                  (click)="setType('expense')"
                >
                  Gasto
                </button>
              </div>
            </div>

            <!-- Cuenta -->
            <div class="form-group">
              <label class="form-label">Cuenta *</label>
              <select class="form-select" formControlName="account_id">
                <option value="">Seleccionar cuenta</option>
                <option *ngFor="let account of accounts()" [value]="account.id">
                  {{ account.name || account.account_name }}
                </option>
              </select>
              <div class="error-message" *ngIf="form.get('account_id')?.hasError('required') && form.get('account_id')?.touched">
                La cuenta es obligatoria
              </div>
            </div>

            <!-- Categoría -->
            <div class="form-group">
              <label class="form-label">Categoría *</label>
              <select class="form-select" formControlName="category_id">
                <option value="">Seleccionar categoría</option>
                <option *ngFor="let category of filteredCategories()" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
              <div class="error-message" *ngIf="form.get('category_id')?.hasError('required') && form.get('category_id')?.touched">
                La categoría es obligatoria
              </div>
            </div>

            <!-- Fecha -->
            <div class="form-group">
              <label class="form-label">Fecha *</label>
              <input 
                type="date" 
                class="form-input" 
                formControlName="date"
              />
              <div class="error-message" *ngIf="form.get('date')?.hasError('required') && form.get('date')?.touched">
                La fecha es obligatoria
              </div>
            </div>

            <!-- Importe -->
            <div class="form-group">
              <label class="form-label">Importe *</label>
              <input 
                type="number" 
                class="form-input" 
                formControlName="amount"
                step="0.01"
                placeholder="0.00"
              />
              <div class="error-message" *ngIf="form.get('amount')?.hasError('required') && form.get('amount')?.touched">
                El importe es obligatorio
              </div>
              <div class="error-message" *ngIf="form.get('amount')?.hasError('min') && form.get('amount')?.touched">
                El importe debe ser mayor a 0
              </div>
            </div>

            <!-- Descripción -->
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <input 
                type="text" 
                class="form-input" 
                formControlName="description"
                placeholder="Ej: Compra en supermercado"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="saving()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
              <span *ngIf="!saving()">Guardar cambios</span>
              <span *ngIf="saving()">
                <div class="btn-spinner"></div>
                Guardando...
              </span>
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
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .close-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .close-button:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #6b7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .form-input,
    .form-select {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input[readonly] {
      background-color: #f9fafb;
      cursor: not-allowed;
    }

    .error-message {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: -0.25rem;
    }

    .type-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .type-btn {
      padding: 0.75rem;
      border: 2px solid #d1d5db;
      background: white;
      color: #6b7280;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .type-btn:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .type-btn.active.income {
      background: #d1fae5;
      border-color: #10b981;
      color: #065f46;
    }

    .type-btn.active.expense {
      background: #fee2e2;
      border-color: #ef4444;
      color: #991b1b;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @media (max-width: 640px) {
      .modal-content {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }
    }
  `]
})
export class EditTransactionModalComponent implements OnInit {
  @Input() transaction!: Transaction;
  @Output() closeModal = new EventEmitter<void>();
  @Output() transactionUpdated = new EventEmitter<Transaction>();

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private accountService = inject(AccountService);

  form!: FormGroup;
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  categories = signal<Category[]>([]);
  accounts = signal<Account[]>([]);

  filteredCategories = computed(() => {
    const type = this.form?.get('type')?.value;
    return this.categories().filter(c => 
      (c.type || c.category_type) === type
    );
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    // Determinar el tipo de transacción
    const transactionType = this.transaction.type || this.transaction.transaction_type || 'expense';
    
    // Formatear la fecha
    const transactionDate = this.transaction.date || this.transaction.transaction_date || new Date().toISOString().split('T')[0];
    const formattedDate = new Date(transactionDate).toISOString().split('T')[0];

    this.form = this.fb.group({
      type: [transactionType, Validators.required],
      account_id: [this.transaction.account_id, Validators.required],
      category_id: [this.transaction.category_id, Validators.required],
      date: [formattedDate, Validators.required],
      amount: [Math.abs(this.transaction.amount), [Validators.required, Validators.min(0.01)]],
      description: [this.transaction.description || '']
    });

    // Escuchar cambios en el tipo para filtrar categorías
    this.form.get('type')?.valueChanges.subscribe(() => {
      this.form.get('category_id')?.setValue('');
    });
  }

  private loadData(): void {
    this.loading.set(true);

    // Cargar categorías y cuentas en paralelo
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => console.error('Error loading categories:', err)
    });

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
        this.loading.set(false);
      }
    });
  }

  setType(type: 'income' | 'expense'): void {
    this.form.patchValue({ type });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);

    const formValue = this.form.value;
    
    // Preparar el payload según el tipo
    const amount = formValue.type === 'expense' 
      ? -Math.abs(formValue.amount) 
      : Math.abs(formValue.amount);

    const updatedTransaction = {
      account_id: formValue.account_id,
      category_id: formValue.category_id,
      date: formValue.date,
      amount: amount,
      description: formValue.description || '',
      type: formValue.type
    };

    console.log('📝 Actualizando transacción:', this.transaction.id, updatedTransaction);

    this.transactionService.updateTransaction(this.transaction.id, updatedTransaction).subscribe({
      next: (transaction) => {
        console.log('✅ Transacción actualizada exitosamente:', transaction);
        this.saving.set(false);
        this.transactionUpdated.emit(transaction);
      },
      error: (err) => {
        console.error('❌ Error al actualizar transacción:', err);
        alert('Error al actualizar la transacción. Por favor, intenta de nuevo.');
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
