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
    /* ========================================
       MODAL - INSTITUTIONAL DESIGN
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
      max-width: 480px;
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
      padding: var(--space-5);
      border-bottom: var(--border-subtle);
    }

    .modal-title {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: var(--tracking-wide);
    }

    .close-button {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--space-2);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .close-button:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .close-button svg {
      width: 18px;
      height: 18px;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      color: var(--text-muted);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid var(--bg-hover);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: var(--space-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Modal Body */
    .modal-body {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    /* Form Group */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .form-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input,
    .form-select {
      padding: var(--space-3);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px var(--color-accent-subtle);
    }

    .form-input[type="number"] {
      font-family: var(--font-data);
    }

    .form-input[readonly] {
      background: var(--bg-hover);
      cursor: not-allowed;
      color: var(--text-muted);
    }

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394A3B8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right var(--space-3) center;
      padding-right: var(--space-10);
      cursor: pointer;
    }

    .error-message {
      font-size: 0.75rem;
      color: var(--color-negative);
      margin-top: var(--space-1);
    }

    /* Type Buttons */
    .type-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .type-btn {
      padding: var(--space-3);
      border: var(--border-default);
      background: transparent;
      color: var(--text-muted);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }

    .type-btn:hover {
      background: var(--bg-hover);
      border-color: var(--color-slate-500);
      color: var(--text-primary);
    }

    .type-btn.active.income {
      background: rgba(34, 160, 107, 0.12);
      border-color: var(--color-positive);
      color: var(--color-positive);
    }

    .type-btn.active.expense {
      background: rgba(202, 53, 33, 0.12);
      border-color: var(--color-negative);
      color: var(--color-negative);
    }

    /* Modal Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-5);
      border-top: var(--border-subtle);
      background: var(--bg-elevated);
    }

    .btn {
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-muted);
      border: var(--border-subtle);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(11, 17, 32, 0.2);
      border-top-color: var(--color-slate-950);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    /* Responsive */
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
    this.categoryService.getAllAvailableCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => console.error('Error loading categories')
    });

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: () => {
        console.error('Error loading accounts');
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

    this.transactionService.updateTransaction(this.transaction.id, updatedTransaction).subscribe({
      next: (transaction) => {
        this.saving.set(false);
        this.transactionUpdated.emit(transaction);
      },
      error: () => {
        console.error('Error al actualizar transacción');
        alert('Error al actualizar la transacción. Por favor, intenta de nuevo.');
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
