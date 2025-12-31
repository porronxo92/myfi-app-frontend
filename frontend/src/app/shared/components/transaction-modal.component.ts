import { Component, inject, signal, computed, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { AccountService } from '../../core/services/account.service';
import { Category } from '../../core/models/category.model';
import { Account } from '../../core/models/account.model';

export interface TransactionModalConfig {
  mode: 'transaction' | 'transfer';
  preselectedAccountId?: string;
  accountName?: string;
}

// Category IDs for transfers
const TRANSFER_EXPENSE_CATEGORY_ID = '88d52b3c-9d8f-4008-bb51-5adb398ac4de'; // Transferencia (expense)
const TRANSFER_INCOME_CATEGORY_ID = '94c7e01f-ee86-4684-9bb8-37e8a4d378e0'; // Ingreso (income)

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ modalTitle() }}</h2>
          <button class="close-button" (click)="onCancel()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <!-- Account (readonly if preselected, selector otherwise) -->
            <div class="form-group">
              <label class="form-label">Cuenta *</label>
              <!-- Show readonly input when account is preselected -->
              <input 
                *ngIf="config.preselectedAccountId"
                type="text"
                class="form-input"
                [value]="config.accountName || 'Cuenta seleccionada'"
                readonly
                style="background-color: #f8fafc; cursor: not-allowed;"
              />
              <!-- Show select when no account is preselected -->
              <select 
                *ngIf="!config.preselectedAccountId"
                class="form-select"
                formControlName="account_id"
              >
                
                <option *ngFor="let account of accounts()" [value]="account.id">
                  {{ account.name || account.account_name }}
                </option>
              </select>
              <div class="error-message" *ngIf="form.get('account_id')?.hasError('required') && form.get('account_id')?.touched">
                La cuenta es obligatoria
              </div>
            </div>

            <!-- Type (only for transaction mode) -->
            <div class="form-group" *ngIf="isTransactionMode()">
              <label class="form-label">Tipo de transacción *</label>
              <div class="type-buttons">
                <button 
                  type="button"
                  class="type-btn"
                  [class.income]="form.get('type')?.value === 'income'"
                  [class.active]="form.get('type')?.value === 'income'"
                  (click)="setType('income')"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  Ingreso
                </button>
                <button 
                  type="button"
                  class="type-btn"
                  [class.expense]="form.get('type')?.value === 'expense'"
                  [class.active]="form.get('type')?.value === 'expense'"
                  (click)="setType('expense')"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
                  </svg>
                  Gasto
                </button>
              </div>
              <div class="error-message" *ngIf="form.get('type')?.touched && form.get('type')?.hasError('required')">
                El tipo de transacción es obligatorio
              </div>
            </div>

            <!-- Transfer Account (only for transfer mode) -->
            <div class="form-group" *ngIf="isTransferMode()">
              <label class="form-label">Cuenta de destino *</label>
              <select class="form-select" formControlName="transfer_account_id">
                
                <option 
                  *ngFor="let account of availableTransferAccounts()" 
                  [value]="account.id"
                >
                  {{ account.name || account.account_name }}
                </option>
              </select>
              <div class="hint-text">Cuenta a la que quieres transferir</div>
              <div class="error-message" *ngIf="form.get('transfer_account_id')?.hasError('required') && form.get('transfer_account_id')?.touched">
                La cuenta de destino es obligatoria
              </div>
            </div>

            <!-- Category -->
            <div class="form-group">
              <label class="form-label">Categoría *</label>
              <!-- For transfers: show fixed "Ingreso" text -->
              <input 
                *ngIf="isTransferMode()"
                type="text"
                class="form-input"
                value="Gasto"
                readonly
                style="background-color: #f8fafc; cursor: not-allowed;"
              />
              <!-- For transactions: show category selector -->
              <select 
                *ngIf="isTransactionMode()"
                class="form-select" 
                formControlName="category_id"
              >
                
                <option 
                  *ngFor="let category of filteredCategories()" 
                  [value]="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <div class="error-message" *ngIf="form.get('category_id')?.hasError('required') && form.get('category_id')?.touched">
                La categoría es obligatoria
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label">Descripción *</label>
              <input 
                type="text"
                class="form-input" 
                formControlName="description" 
                placeholder="Ej: Compra en supermercado"
              />
              <div class="error-message" *ngIf="form.get('description')?.hasError('required') && form.get('description')?.touched">
                La descripción es obligatoria
              </div>
            </div>

            <!-- Amount and Date in a row -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Importe *</label>
                <div class="input-with-icon">
                  <span class="input-icon">€</span>
                  <input 
                    type="number" 
                    class="form-input with-icon" 
                    formControlName="amount" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0.01"
                  />
                </div>
                <div class="error-message" *ngIf="form.get('amount')?.invalid && form.get('amount')?.touched">
                  <span *ngIf="form.get('amount')?.hasError('required')">El importe es obligatorio</span>
                  <span *ngIf="form.get('amount')?.hasError('min')">El importe debe ser mayor a 0</span>
                </div>
              </div>

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
            </div>

            <!-- Tags -->
            <div class="form-group">
              <label class="form-label">Etiquetas (opcional)</label>
              <div class="tags-container">
                <input
                  type="text"
                  class="form-input"
                  placeholder="Escribe y presiona Enter..."
                  [(ngModel)]="tagInput"
                  [ngModelOptions]="{standalone: true}"
                  (keydown.enter)="addTag($event)"
                />
                <div class="tags-list" *ngIf="tags().length > 0">
                  <span *ngFor="let tag of tags()" class="tag">
                    {{ tag }}
                    <button type="button" class="tag-remove" (click)="removeTag(tag)">×</button>
                  </span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">Notas adicionales (opcional)</label>
              <textarea 
                class="form-textarea" 
                formControlName="notes" 
                rows="3" 
                placeholder="Añade información adicional..."
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="onCancel()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary" 
              [disabled]="form.invalid || submitting()"
            >
              <span *ngIf="!submitting()">Guardar</span>
              <span *ngIf="submitting()">Guardando...</span>
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
    .form-select,
    .form-textarea {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      color: #0f172a;
      transition: all 0.2s;
      font-family: inherit;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
      color: #94a3b8;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .hint-text {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: -0.25rem;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: -0.25rem;
    }

    /* Type Buttons */
    .type-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .type-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
      color: #64748b;
    }

    .type-btn:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .type-btn.active.income {
      border-color: #10b981;
      background: #ecfdf5;
      color: #10b981;
    }

    .type-btn.active.expense {
      border-color: #ef4444;
      background: #fef2f2;
      color: #ef4444;
    }

    .type-btn svg {
      width: 20px;
      height: 20px;
    }

    /* Tags */
    .tags-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: #f1f5f9;
      color: #475569;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .tag-remove {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      padding: 0;
      transition: color 0.2s;
    }

    .tag-remove:hover {
      color: #ef4444;
    }

    /* Footer */
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

    /* Responsive */
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

      .form-row {
        grid-template-columns: 1fr;
      }

      .type-buttons {
        grid-template-columns: 1fr;
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
export class TransactionModalComponent implements OnInit {
  @Input() config!: TransactionModalConfig;
  @Output() closeModal = new EventEmitter<void>();
  @Output() transactionCreated = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private accountService = inject(AccountService);

  // State
  form!: FormGroup;
  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  tags = signal<string[]>([]);
  tagInput = '';
  submitting = signal(false);

  // Computed
  modalTitle = computed(() => 
    this.config.mode === 'transfer' ? 'Nueva Transferencia' : 'Nueva Transacción'
  );

  // No need to filter - categories are already filtered by the backend based on type
  filteredCategories = computed(() => this.categories());

  availableTransferAccounts = computed(() => {
    const currentAccountId = this.form?.get('account_id')?.value;
    return this.accounts().filter(acc => acc.id !== currentAccountId);
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      account_id: [{ value: this.config.preselectedAccountId || null, disabled: !!this.config.preselectedAccountId }, Validators.required],
      type: [this.config.mode === 'transfer' ? 'income' : null, Validators.required],
      transfer_account_id: [null],
      category_id: [null, Validators.required],
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [today, Validators.required],
      notes: ['']
    });

    // Add validator for transfer_account_id if in transfer mode
    if (this.config.mode === 'transfer') {
      this.form.get('transfer_account_id')?.setValidators(Validators.required);
      this.form.get('type')?.disable(); // Type is fixed for transfers
      this.form.get('type')?.setValue('income');
      // For transfers, category_id is not required since we show fixed text
      this.form.get('category_id')?.clearValidators();
      this.form.get('category_id')?.updateValueAndValidity();
    }

    // Update category options when type changes (only for transactions)
    if (this.config.mode === 'transaction') {
      this.form.get('type')?.valueChanges.subscribe((type) => {
        this.form.get('category_id')?.setValue(null);
        // Reload categories filtered by type
        this.loadCategoriesByType(type);
      });
    }

    // Validate that transfer account is different from source account
    this.form.get('transfer_account_id')?.valueChanges.subscribe(transferAccountId => {
      const sourceAccountId = this.form.getRawValue().account_id;
      if (transferAccountId && transferAccountId === sourceAccountId) {
        this.form.get('transfer_account_id')?.setErrors({ sameAccount: true });
      }
    });
  }

  private loadCategoriesByType(type: 'income' | 'expense' | null): void {
    if (type) {
      this.categoryService.getAllAvailableCategories(type).subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: (err) => {
          console.error('Error loading categories:', err);
        }
      });
    } else {
      // Load all categories if no type selected
      this.categoryService.getAllAvailableCategories().subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: (err) => {
          console.error('Error loading categories:', err);
        }
      });
    }
  }

  private loadData(): void {
    // Load accounts from cache if available, otherwise fetch from API
    const cachedAccounts = this.accountService.accounts();
    if (cachedAccounts.length > 0) {
      this.accounts.set(cachedAccounts);
    } else {
      this.accountService.getAccounts().subscribe({
        next: (accounts) => {
          this.accounts.set(accounts);
        },
        error: (err) => {
          console.error('Error loading accounts:', err);
        }
      });
    }

    // Only load categories for transaction mode (not needed for transfers)
    if (this.config.mode === 'transaction') {
      // Load all categories initially (no type filter)
      this.loadCategoriesByType(null);
    }
  }

  isTransactionMode(): boolean {
    return this.config.mode === 'transaction';
  }

  isTransferMode(): boolean {
    return this.config.mode === 'transfer';
  }

  isAccountPreselected(): boolean {
    return !!this.config.preselectedAccountId;
  }

  setType(type: 'income' | 'expense'): void {
    this.form.get('type')?.setValue(type);
    this.form.get('type')?.markAsTouched();
  }

  addTag(event: Event): void {
    event.preventDefault();
    const tag = this.tagInput.trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update(tags => [...tags, tag]);
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.tags.update(tags => tags.filter(t => t !== tag));
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);

    // Use getRawValue() to get disabled fields like account_id
    const formValue = this.form.getRawValue();
    
    if (this.config.mode === 'transfer' && formValue.transfer_account_id) {
      // For transfers: Create TWO transactions
      const amount = parseFloat(formValue.amount);
      
      // Transaction 1: Expense in origin account (money leaving)
      const expensePayload: any = {
        account_id: formValue.account_id,
        type: 'expense',
        category_id: TRANSFER_EXPENSE_CATEGORY_ID,
        description: formValue.description,
        amount: amount,
        date: formValue.date,
        source: 'manual',
        transfer_account_id: formValue.transfer_account_id // Link to destination account
      };

      // Transaction 2: Income in destination account (money arriving)
      const incomePayload: any = {
        account_id: formValue.transfer_account_id,
        type: 'income',
        category_id: TRANSFER_INCOME_CATEGORY_ID,
        description: formValue.description,
        amount: amount,
        date: formValue.date,
        source: 'manual',
        transfer_account_id: formValue.account_id // Link to origin account
      };

      // Add optional fields if present
      if (formValue.notes) {
        expensePayload.notes = formValue.notes;
        incomePayload.notes = formValue.notes;
      }

      if (this.tags().length > 0) {
        expensePayload.tags = this.tags();
        incomePayload.tags = this.tags();
      }

      // Create both transactions simultaneously
      forkJoin({
        expense: this.transactionService.createTransaction(expensePayload),
        income: this.transactionService.createTransaction(incomePayload)
      }).subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.transactionCreated.emit(result);
          this.closeModal.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Error creating transfer transactions:', err);
          // TODO: Show error message to user
        }
      });
    } else {
      // For regular transactions: Create ONE transaction
      const payload: any = {
        account_id: formValue.account_id,
        type: formValue.type,
        category_id: formValue.category_id,
        description: formValue.description,
        amount: parseFloat(formValue.amount),
        date: formValue.date,
        source: 'manual'
      };

      // Add optional fields if present
      if (formValue.notes) {
        payload.notes = formValue.notes;
      }

      if (this.tags().length > 0) {
        payload.tags = this.tags();
      }

      // Call service to create transaction
      this.transactionService.createTransaction(payload).subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.transactionCreated.emit(result);
          this.closeModal.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Error creating transaction:', err);
          // TODO: Show error message to user
        }
      });
    }
  }
}
