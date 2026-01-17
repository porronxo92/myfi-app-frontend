import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

export interface BudgetItemData {
  id: string;
  category_id: string;
  category_name: string;
  allocated_amount: number;
  notes?: string;
}

@Component({
  selector: 'app-edit-budget-item-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Editar Partida del Presupuesto</h2>
          <button class="close-button" (click)="onCancel()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <!-- Categoría (readonly) -->
            <div class="form-group">
              <label class="form-label">Categoría</label>
              <input 
                type="text" 
                class="form-input" 
                [value]="budgetItem.category_name"
                readonly
                style="background-color: #f9fafb; cursor: not-allowed;"
              />
              <small class="form-help">La categoría no se puede cambiar</small>
            </div>

            <!-- Importe Asignado -->
            <div class="form-group">
              <label class="form-label">Importe Asignado *</label>
              <div class="input-with-icon">
                <span class="input-icon">€</span>
                <input 
                  type="number" 
                  class="form-input with-icon" 
                  formControlName="allocated_amount"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div class="error-message" *ngIf="form.get('allocated_amount')?.hasError('required') && form.get('allocated_amount')?.touched">
                El importe es obligatorio
              </div>
              <div class="error-message" *ngIf="form.get('allocated_amount')?.hasError('min') && form.get('allocated_amount')?.touched">
                El importe debe ser mayor a 0
              </div>
            </div>

            <!-- Notas -->
            <div class="form-group">
              <label class="form-label">Notas (opcional)</label>
              <textarea 
                class="form-textarea" 
                formControlName="notes"
                rows="3"
                placeholder="Agregar notas sobre esta partida del presupuesto..."
              ></textarea>
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

    .form-help {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .form-input,
    .form-textarea {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input[readonly] {
      background-color: #f9fafb;
      cursor: not-allowed;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .input-with-icon {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-input.with-icon {
      padding-left: 2rem;
    }

    .error-message {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: -0.25rem;
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

    @keyframes spin {
      to { transform: rotate(360deg); }
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
export class EditBudgetItemModalComponent implements OnInit {
  @Input() budgetItem!: BudgetItemData;
  @Output() closeModal = new EventEmitter<void>();
  @Output() itemUpdated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private budgetService = inject(BudgetService);

  form!: FormGroup;
  saving = signal<boolean>(false);

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      allocated_amount: [this.budgetItem.allocated_amount, [Validators.required, Validators.min(0.01)]],
      notes: [this.budgetItem.notes || '']
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);

    const updateData = {
      category_id: this.budgetItem.category_id,
      allocated_amount: this.form.value.allocated_amount,
      notes: this.form.value.notes || ''
    };

    console.log('📝 Actualizando budget item:', this.budgetItem.id, updateData);

    this.budgetService.updateBudgetItem(this.budgetItem.id, updateData).subscribe({
      next: () => {
        console.log('✅ Budget item actualizado exitosamente');
        this.saving.set(false);
        this.itemUpdated.emit();
      },
      error: (err) => {
        console.error('❌ Error al actualizar budget item:', err);
        alert('Error al actualizar la partida del presupuesto. Por favor, intenta de nuevo.');
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
