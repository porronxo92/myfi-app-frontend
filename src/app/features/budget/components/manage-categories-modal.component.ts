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
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      z-index: 1000;
    }

    .modal-panel {
      background: white;
      height: 100vh;
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
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
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      i {
        color: #6b7280;
        font-size: 1.25rem;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }
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

      &:hover {
        background: #e5e7eb;
        color: #111827;
      }
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .action-bar {
      display: flex;
      justify-content: flex-end;
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .tab {
      flex: 1;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: #6b7280;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: -2px;

      &:hover {
        color: #111827;
        background: #f9fafb;
      }

      &.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
      }

      i {
        font-size: 0.875rem;
      }
    }

    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        border-color: #d1d5db;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .category-color {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      flex-shrink: 0;
      border: 2px solid rgba(0, 0, 0, 0.1);
    }

    .category-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .category-name {
      font-weight: 600;
      color: #111827;
      font-size: 0.9375rem;
    }

    .category-stats {
      font-size: 0.8125rem;
      color: #6b7280;
    }

    .category-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #f3f4f6;
        color: #3b82f6;
      }

      &.btn-danger:hover {
        background: #fee2e2;
        color: #ef4444;
      }

      i {
        font-size: 0.875rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #9ca3af;

      i {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
      }

      p {
        margin: 0;
        font-size: 0.9375rem;
      }
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
      }
    }

    .btn-back {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;

      &:hover {
        background: #f3f4f6;
        color: #111827;
      }
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

    .form-input {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .radio-group {
      display: flex;
      gap: 1rem;
    }

    .radio-option {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:has(input:checked) {
        border-color: #3b82f6;
        background: #eff6ff;
      }

      input[type="radio"] {
        margin-right: 0.75rem;
      }

      .radio-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        color: #374151;

        i {
          font-size: 0.875rem;
        }
      }
    }

    .color-picker {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .color-input {
      width: 60px;
      height: 45px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      cursor: pointer;
    }

    .color-text {
      flex: 1;
    }

    .color-palette {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 0.5rem;
    }

    .color-swatch {
      width: 40px;
      height: 40px;
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
        border-color: rgba(0, 0, 0, 0.2);
      }

      &.selected {
        border-color: #111827;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #111827;
      }
    }

    .error-message {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: -0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1.5rem;
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

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;

      &:hover:not(:disabled) {
        background: #e5e7eb;
      }
    }

    .btn-primary {
      background: #3b82f6;
      color: white;

      &:hover:not(:disabled) {
        background: #2563eb;
      }

      i {
        font-size: 0.875rem;
      }
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
    this.categoryService.getCategories().subscribe();
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
        console.log(`✅ Categoría ${this.viewMode() === 'create' ? 'creada' : 'actualizada'} exitosamente`);
        this.saving.set(false);
        this.viewMode.set('list');
        this.categoriesUpdated.emit();
      },
      error: (err) => {
        console.error('❌ Error:', err);
        alert(`Error al ${this.viewMode() === 'create' ? 'crear' : 'actualizar'} la categoría`);
        this.saving.set(false);
      }
    });
  }

  confirmDelete(category: Category): void {
    const confirmed = confirm(
      `¿Estás seguro de eliminar la categoría "${category.name}"?\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        console.log('✅ Categoría eliminada exitosamente');
        this.categoriesUpdated.emit();
      },
      error: (err) => {
        console.error('❌ Error al eliminar categoría:', err);
        alert('Error al eliminar la categoría. Puede que tenga transacciones asociadas.');
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
