import { Component, inject, signal, computed, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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

          <!-- Error Message -->
          <div class="form-error-banner" *ngIf="errorMessage()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMessage() }}
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
    /* ========================================
       TRANSACTION MODAL - INSTITUTIONAL
       ======================================== */
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--overlay-bg);
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
    .form-select,
    .form-textarea {
      padding: var(--space-3) var(--space-4);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      color: var(--text-primary);
      transition: all var(--transition-fast);
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px var(--color-accent-subtle);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
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

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
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

    .hint-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .error-message {
      color: var(--color-negative);
      font-size: 0.75rem;
      margin-top: var(--space-1);
    }

    .form-error-banner {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      margin: 0 var(--space-6) var(--space-2);
      background: rgba(202, 53, 33, 0.08);
      border: 1px solid var(--color-negative);
      border-radius: var(--radius-md);
      color: var(--color-negative);
      font-size: 0.8125rem;
    }

    /* Type Buttons */
    .type-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .type-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3);
      border: var(--border-subtle);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--text-muted);
    }

    .type-btn:hover {
      border-color: var(--color-slate-500);
      background: var(--bg-hover);
    }

    .type-btn.active.income {
      border-color: var(--color-positive);
      background: rgba(34, 160, 107, 0.1);
      color: var(--color-positive);
    }

    .type-btn.active.expense {
      border-color: var(--color-negative);
      background: rgba(202, 53, 33, 0.1);
      color: var(--color-negative);
    }

    .type-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Tags */
    .tags-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-3);
      background: var(--color-accent-subtle);
      color: var(--color-accent);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .tag-remove {
      background: none;
      border: none;
      color: var(--color-accent);
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0;
      opacity: 0.7;
      transition: opacity var(--transition-fast);
    }

    .tag-remove:hover {
      opacity: 1;
    }

    /* Footer */
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

    /* Responsive */
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
  errorMessage = signal<string | null>(null);

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
        error: () => {
          console.error('Error loading categories');
        }
      });
    } else {
      // Load all categories if no type selected
      this.categoryService.getAllAvailableCategories().subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: () => {
          console.error('Error loading categories');
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
        error: () => {
          console.error('Error loading accounts');
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
    this.errorMessage.set(null);

    // Use getRawValue() to get disabled fields like account_id
    const formValue = this.form.getRawValue();
    
    if (this.config.mode === 'transfer' && formValue.transfer_account_id) {
      // Transferencia atómica — un solo endpoint crea ambas transacciones en el backend
      const transferPayload: any = {
        from_account_id: formValue.account_id,
        to_account_id: formValue.transfer_account_id,
        amount: Math.abs(parseFloat(formValue.amount)),
        description: formValue.description,
        date: formValue.date
      };

      if (formValue.notes) {
        transferPayload.notes = formValue.notes;
      }

      if (this.tags().length > 0) {
        transferPayload.tags = this.tags();
      }

      this.transactionService.createTransfer(transferPayload).subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.transactionCreated.emit(result);
          this.closeModal.emit();
        },
        error: (err: any) => {
          this.submitting.set(false);
          const detail = err?.error?.detail;
          const msg = Array.isArray(detail)
            ? detail.map((d: any) => d.msg ?? d).join(', ')
            : (detail || 'Error al crear la transferencia. Inténtalo de nuevo.');
          this.errorMessage.set(msg);
        }
      });
    } else {
      // For regular transactions: Create ONE transaction
      const payload: any = {
        account_id: formValue.account_id,
        type: formValue.type,
        category_id: formValue.category_id,
        description: formValue.description,
        amount: formValue.type === 'expense'
          ? -Math.abs(parseFloat(formValue.amount))
          : Math.abs(parseFloat(formValue.amount)),
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
        error: (err: any) => {
          this.submitting.set(false);
          const detail = err?.error?.detail;
          const msg = Array.isArray(detail)
            ? detail.map((d: any) => d.msg ?? d).join(', ')
            : (detail || 'Error al crear la transacción. Inténtalo de nuevo.');
          this.errorMessage.set(msg);
        }
      });
    }
  }
}
