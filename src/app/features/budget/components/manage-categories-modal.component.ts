import { Component, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

type ViewMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-manage-categories-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-panel" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title">
            <i class="fas fa-cog"></i>
            <h2>Gestión de Categorías</h2>
          </div>
          <button class="close-button" (click)="onClose()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Lista de categorías -->
        <div *ngIf="viewMode() === 'list'" class="modal-body">
          <!-- Botón crear -->
          <div class="action-bar">
            <button class="btn btn-primary" (click)="startCreate()">
              <i class="fas fa-plus"></i>
              Nueva Categoría
            </button>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button 
              class="tab"
              [class.active]="selectedTab() === 'expense'"
              (click)="selectedTab.set('expense')">
              <i class="fas fa-arrow-up"></i>
              Gastos ({{ expenseCategories().length }})
            </button>
            <button 
              class="tab"
              [class.active]="selectedTab() === 'income'"
              (click)="selectedTab.set('income')">
              <i class="fas fa-arrow-down"></i>
              Ingresos ({{ incomeCategories().length }})
            </button>
          </div>

          <!-- Lista -->
          <div class="categories-list">
            <div 
              *ngFor="let category of filteredCategories()" 
              class="category-item">
              <div class="category-info">
                <div 
                  class="category-color" 
                  [style.background-color]="category.color">
                </div>
                <div class="category-details">
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-stats" *ngIf="category.transaction_count">
                    {{ category.transaction_count }} transacciones
                  </span>
                </div>
              </div>
              <div class="category-actions">
                <button 
                  class="btn-icon" 
                  (click)="startEdit(category)"
                  title="Editar">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button 
                  class="btn-icon btn-danger" 
                  (click)="confirmDelete(category)"
                  title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div *ngIf="filteredCategories().length === 0" class="empty-state">
              <i class="fas fa-folder-open"></i>
              <p>No hay categorías de {{ selectedTab() === 'income' ? 'ingresos' : 'gastos' }}</p>
            </div>
          </div>
        </div>

        <!-- Formulario crear/editar -->
        <div *ngIf="viewMode() === 'create' || viewMode() === 'edit'" class="modal-body">
          <div class="form-header">
            <button class="btn-back" (click)="cancelForm()">
              <i class="fas fa-arrow-left"></i>
              Volver
            </button>
            <h3>{{ viewMode() === 'create' ? 'Nueva Categoría' : 'Editar Categoría' }}</h3>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Nombre -->
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input 
                type="text" 
                class="form-input" 
                formControlName="name"
                placeholder="Ej: Supermercado, Salario, etc."
              />
              <div class="error-message" *ngIf="form.get('name')?.hasError('required') && form.get('name')?.touched">
                El nombre es obligatorio
              </div>
            </div>

            <!-- Tipo -->
            <div class="form-group">
              <label class="form-label">Tipo *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input 
                    type="radio" 
                    formControlName="type" 
                    value="expense"
                  />
                  <span class="radio-label">
                    <i class="fas fa-arrow-up"></i>
                    Gasto
                  </span>
                </label>
                <label class="radio-option">
                  <input 
                    type="radio" 
                    formControlName="type" 
                    value="income"
                  />
                  <span class="radio-label">
                    <i class="fas fa-arrow-down"></i>
                    Ingreso
                  </span>
                </label>
              </div>
            </div>

            <!-- Color -->
            <div class="form-group">
              <label class="form-label">Color</label>
              <div class="color-picker">
                <input 
                  type="color" 
                  class="color-input" 
                  formControlName="color"
                />
                <input 
                  type="text" 
                  class="form-input color-text" 
                  formControlName="color"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <!-- Paleta de colores sugeridos -->
            <div class="form-group">
              <label class="form-label">Colores sugeridos</label>
              <div class="color-palette">
                <button 
                  *ngFor="let color of suggestedColors" 
                  type="button"
                  class="color-swatch"
                  [style.background-color]="color"
                  [class.selected]="form.get('color')?.value === color"
                  (click)="selectColor(color)"
                  [title]="color">
                </button>
              </div>
            </div>

            <!-- Botones -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelForm()" [disabled]="saving()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                <span *ngIf="!saving()">
                  {{ viewMode() === 'create' ? 'Crear' : 'Guardar' }}
                </span>
                <span *ngIf="saving()">
                  <div class="btn-spinner"></div>
                  Guardando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========================================
       MANAGE CATEGORIES MODAL - INSTITUTIONAL
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
      justify-content: flex-end;
      z-index: 1000;
    }

    .modal-panel {
      background: var(--bg-card);
      height: 100vh;
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      border-left: var(--border-subtle);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-5);
      border-bottom: var(--border-subtle);
      background: var(--bg-elevated);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--space-3);

      i {
        color: var(--color-accent);
        font-size: 1rem;
      }

      h2 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
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

      &:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .action-bar {
      display: flex;
      justify-content: flex-end;
    }

    .tabs {
      display: flex;
      gap: var(--space-2);
      border-bottom: var(--border-subtle);
    }

    .tab {
      flex: 1;
      padding: var(--space-3) var(--space-4);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-bottom: -1px;

      &:hover {
        color: var(--text-primary);
        background: var(--bg-elevated);
      }

      &.active {
        color: var(--color-accent);
        border-bottom-color: var(--color-accent);
      }

      i {
        font-size: 0.75rem;
      }
    }

    .categories-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--bg-hover);
        border-color: var(--color-slate-500);
      }
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex: 1;
    }

    .category-color {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      flex-shrink: 0;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .category-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .category-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .category-stats {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .category-actions {
      display: flex;
      gap: var(--space-2);
    }

    .btn-icon {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--bg-hover);
        color: var(--color-accent);
      }

      &.btn-danger:hover {
        background: rgba(202, 53, 33, 0.1);
        color: var(--color-negative);
      }

      i {
        font-size: 0.8125rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--space-10) var(--space-4);
      color: var(--text-muted);

      i {
        font-size: 2rem;
        margin-bottom: var(--space-4);
        display: block;
        color: var(--text-faint);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-4);

      h3 {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .btn-back {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 500;
      font-size: 0.8125rem;

      &:hover {
        background: var(--bg-elevated);
        color: var(--text-primary);
      }
    }

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

    .form-input {
      padding: var(--space-3);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background: var(--bg-elevated);
      color: var(--text-primary);
      transition: all var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }

      &::placeholder {
        color: var(--text-faint);
      }
    }

    .radio-group {
      display: flex;
      gap: var(--space-4);
    }

    .radio-option {
      flex: 1;
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      background: var(--bg-elevated);

      &:has(input:checked) {
        border-color: var(--color-accent);
        background: var(--color-accent-subtle);
      }

      input[type="radio"] {
        margin-right: var(--space-3);
        accent-color: var(--color-accent);
      }

      .radio-label {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-weight: 500;
        color: var(--text-primary);
        font-size: 0.8125rem;

        i {
          font-size: 0.75rem;
        }
      }
    }

    .color-picker {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    .color-input {
      width: 52px;
      height: 40px;
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      cursor: pointer;
      background: var(--bg-elevated);
    }

    .color-text {
      flex: 1;
    }

    .color-palette {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
      gap: var(--space-2);
    }

    .color-swatch {
      width: 36px;
      height: 36px;
      border: 2px solid transparent;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        transform: scale(1.1);
        border-color: rgba(255, 255, 255, 0.3);
      }

      &.selected {
        border-color: var(--text-primary);
        box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px var(--text-primary);
      }
    }

    .error-message {
      font-size: 0.6875rem;
      color: var(--color-negative);
      margin-top: calc(var(--space-1) * -1);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-4);
      padding-top: var(--space-5);
      border-top: var(--border-subtle);
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

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-muted);
      border: var(--border-subtle);

      &:hover:not(:disabled) {
        background: var(--bg-elevated);
        border-color: var(--color-slate-500);
        color: var(--text-primary);
      }
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);

      &:hover:not(:disabled) {
        background: var(--color-accent-hover);
      }

      i {
        font-size: 0.8125rem;
      }
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--border-subtle);
      border-top-color: var(--color-slate-950);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .modal-panel {
        max-width: 100%;
      }
    }
  `]
})
export class ManageCategoriesModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() categoriesUpdated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  // State
  viewMode = signal<ViewMode>('list');
  selectedTab = signal<'income' | 'expense'>('expense');
  editingCategory = signal<Category | null>(null);
  saving = signal<boolean>(false);

  // Form
  form!: FormGroup;

  // Data from service
  categories = this.categoryService.categories;
  
  // Computed
  incomeCategories = computed(() => 
    this.categories().filter(c => (c.type || c.category_type) === 'income')
  );
  
  expenseCategories = computed(() => 
    this.categories().filter(c => (c.type || c.category_type) === 'expense')
  );
  
  filteredCategories = computed(() => 
    this.selectedTab() === 'income' ? this.incomeCategories() : this.expenseCategories()
  );

  // Paleta de colores sugeridos
  suggestedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#78716c'
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['expense', Validators.required],
      color: ['#3b82f6', Validators.required]
    });
  }

  loadCategories(): void {
    this.categoryService.getAllAvailableCategories().subscribe();
  }

  startCreate(): void {
    this.viewMode.set('create');
    this.editingCategory.set(null);
    this.form.reset({
      name: '',
      type: this.selectedTab(),
      color: this.suggestedColors[Math.floor(Math.random() * this.suggestedColors.length)]
    });
  }

  startEdit(category: Category): void {
    this.viewMode.set('edit');
    this.editingCategory.set(category);
    this.form.patchValue({
      name: category.name,
      type: category.type || category.category_type,
      color: category.color
    });
  }

  cancelForm(): void {
    this.viewMode.set('list');
    this.editingCategory.set(null);
    this.form.reset();
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);

    const formData = {
      name: this.form.value.name,
      type: this.form.value.type,
      color: this.form.value.color
    };

    const operation = this.viewMode() === 'create'
      ? this.categoryService.createCategory(formData)
      : this.categoryService.updateCategory(this.editingCategory()!.id, formData);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.viewMode.set('list');
        this.categoriesUpdated.emit();
      },
      error: () => {
        console.error('Error en operación de categoría');
        alert(`Error al ${this.viewMode() === 'create' ? 'crear' : 'actualizar'} la categoría`);
        this.saving.set(false);
      }
    });
  }

  confirmDelete(category: Category): void {
    const message = category.transaction_count && category.transaction_count > 0
      ? `¿Estás seguro de eliminar la categoría "${category.name}"?\n\n` +
        `Esta categoría tiene ${category.transaction_count} transacción(es) asociada(s).\n` +
        `Las transacciones no se eliminarán, pero quedarán sin categoría.\n\n` +
        `Esta acción no se puede deshacer.`
      : `¿Estás seguro de eliminar la categoría "${category.name}"?\n\n` +
        `Esta acción no se puede deshacer.`;

    const confirmed = confirm(message);

    if (!confirmed) return;

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.categoriesUpdated.emit();
        alert(`Categoría "${category.name}" eliminada correctamente.`);
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        const errorMessage = error?.error?.detail || error?.message ||
          'Error al eliminar la categoría. Puede que tenga transacciones asociadas o sea una categoría del sistema.';
        alert(errorMessage);
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
