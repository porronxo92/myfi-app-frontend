import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../core/services/budget.service';
import { CategoryService } from '../../core/services/category.service';
import { Budget, BudgetProgress, MONTH_NAMES, BudgetItemCreate } from '../../core/models/budget.model';
import { Category } from '../../core/models/category.model';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { EditBudgetItemModalComponent, BudgetItemData } from './components/edit-budget-item-modal.component';
import { ManageCategoriesModalComponent } from './components/manage-categories-modal.component';

interface BudgetItemForm {
  category_id: string;
  allocated_amount: number;
  notes: string;
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    EditBudgetItemModalComponent,
    ManageCategoriesModalComponent
  ],
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  // Expose Math for template
  Math = Math;

  // State
  viewMode = signal<'view' | 'create' | 'edit'>('view');
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());
  
  // Edit modal state
  showEditItemModal = signal<boolean>(false);
  itemToEdit = signal<BudgetItemData | null>(null);
  
  // Manage categories modal state
  showManageCategoriesModal = signal<boolean>(false);
  
  // Data
  currentBudget = this.budgetService.currentBudget;
  currentProgress = this.budgetService.currentProgress;
  budgets = this.budgetService.budgets;
  categories = this.categoryService.categories;
  
  // Loading & Error
  loading = this.budgetService.loading;
  error = this.budgetService.error;

  // Computed
  monthName = computed(() => MONTH_NAMES[this.selectedMonth()]);
  periodLabel = computed(() => `${this.monthName()} ${this.selectedYear()}`);
  
  hasBudgetForCurrentMonth = computed(() => {
    return this.currentBudget() !== null;
  });

  // Form state
  budgetForm = signal<{
    name: string;
    items: BudgetItemForm[];
  }>({
    name: '',
    items: []
  });

  // Computed for form
  expenseCategories = computed(() => {
    return this.categories().filter(c => c.type === 'expense');
  });

  totalBudgetForm = computed(() => {
    return this.budgetForm().items.reduce((sum, item) => sum + (item.allocated_amount || 0), 0);
  });

  availableCategories = computed(() => {
    const usedCategoryIds = this.budgetForm().items.map(item => item.category_id);
    return this.expenseCategories().filter(cat => !usedCategoryIds.includes(cat.id));
  });

  ngOnInit(): void {
    console.log('📊 Módulo de Presupuestos cargado');
    this.loadCurrentBudget();
    this.loadCategories();
    this.loadBudgets();
  }

  // ============================================
  // LOAD DATA
  // ============================================

  loadCurrentBudget(): void {
    this.budgetService.getCurrentBudget().subscribe({
      next: (budget) => {
        if (budget) {
          this.loadBudgetProgress(budget.id);
        }
      },
      error: (err) => {
        console.error('Error loading current budget:', err);
      }
    });
  }

  loadBudgetProgress(budgetId: string): void {
    this.budgetService.getBudgetProgress(budgetId).subscribe({
      error: (err) => {
        console.error('Error loading budget progress:', err);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe();
  }

  loadBudgets(): void {
    this.budgetService.getBudgets(this.selectedYear()).subscribe();
  }

  // ============================================
  // NAVIGATION
  // ============================================

  goToCreateBudget(): void {
    this.viewMode.set('create');
    this.initializeForm();
  }

  goToEditBudget(): void {
    this.viewMode.set('edit');
    this.loadFormFromBudget();
  }

  cancelEdit(): void {
    this.viewMode.set('view');
    this.resetForm();
  }

  // ============================================
  // FORM MANAGEMENT
  // ============================================

  initializeForm(): void {
    this.budgetForm.set({
      name: `${this.monthName()} ${this.selectedYear()}`,
      items: []
    });
  }

  loadFormFromBudget(): void {
    const budget = this.currentBudget();
    if (!budget) return;

    this.budgetForm.set({
      name: budget.name || '',
      items: budget.items.map(item => ({
        category_id: item.category_id,
        allocated_amount: Number(item.allocated_amount),
        notes: item.notes || ''
      }))
    });
  }

  resetForm(): void {
    this.budgetForm.set({
      name: '',
      items: []
    });
  }

  addCategory(): void {
    const available = this.availableCategories();
    if (available.length === 0) {
      alert('No hay más categorías disponibles');
      return;
    }

    const form = this.budgetForm();
    form.items.push({
      category_id: available[0].id,
      allocated_amount: 0,
      notes: ''
    });
    this.budgetForm.set({ ...form });
  }

  removeCategory(index: number): void {
    const form = this.budgetForm();
    form.items.splice(index, 1);
    this.budgetForm.set({ ...form });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || 'Categoría desconocida';
  }

  updateFormName(name: string): void {
    const form = this.budgetForm();
    form.name = name;
    this.budgetForm.set({ ...form });
  }

  updateItemCategory(index: number, categoryId: string): void {
    const form = this.budgetForm();
    form.items[index].category_id = categoryId;
    this.budgetForm.set({ ...form });
  }

  updateItemAmount(index: number, amount: number): void {
    const form = this.budgetForm();
    form.items[index].allocated_amount = amount;
    this.budgetForm.set({ ...form });
  }

  updateItemNotes(index: number, notes: string): void {
    const form = this.budgetForm();
    form.items[index].notes = notes;
    this.budgetForm.set({ ...form });
  }

  validateForm(): string | null {
    const form = this.budgetForm();

    if (form.items.length === 0) {
      return 'Debes añadir al menos una categoría al presupuesto';
    }

    for (const item of form.items) {
      if (!item.category_id) {
        return 'Todas las partidas deben tener una categoría seleccionada';
      }
      if (item.allocated_amount <= 0) {
        return 'Todas las partidas deben tener un monto mayor a 0';
      }
    }

    // Verificar categorías duplicadas
    const categoryIds = form.items.map(i => i.category_id);
    const uniqueIds = new Set(categoryIds);
    if (categoryIds.length !== uniqueIds.size) {
      return 'No puedes tener categorías duplicadas';
    }

    return null;
  }

  saveBudget(): void {
    const validationError = this.validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const form = this.budgetForm();
    const budgetData = {
      month: this.selectedMonth(),
      year: this.selectedYear(),
      name: form.name || undefined,
      items: form.items.map(item => ({
        category_id: item.category_id,
        allocated_amount: item.allocated_amount,
        notes: item.notes || undefined
      }))
    };

    if (this.viewMode() === 'create') {
      this.createBudget(budgetData);
    } else {
      this.updateBudget(budgetData);
    }
  }

  createBudget(data: any): void {
    this.budgetService.createBudget(data).subscribe({
      next: (budget) => {
        console.log('Presupuesto creado exitosamente');
        this.budgetService.currentBudget.set(budget);
        this.loadBudgetProgress(budget.id);
        this.loadBudgets();
        this.viewMode.set('view');
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating budget:', err);
        alert(err.error?.detail || 'Error al crear presupuesto');
      }
    });
  }

  updateBudget(data: any): void {
    const budgetId = this.currentBudget()?.id;
    if (!budgetId) return;

    this.budgetService.updateBudget(budgetId, data).subscribe({
      next: (budget) => {
        console.log('Presupuesto actualizado exitosamente');
        this.budgetService.currentBudget.set(budget);
        this.loadBudgetProgress(budget.id);
        this.loadBudgets();
        this.viewMode.set('view');
        this.resetForm();
      },
      error: (err) => {
        console.error('Error updating budget:', err);
        alert(err.error?.detail || 'Error al actualizar presupuesto');
      }
    });
  }

  // ============================================
  // MONTH NAVIGATION
  // ============================================

  goToPreviousMonth(): void {
    if (this.selectedMonth() === 1) {
      this.selectedMonth.set(12);
      this.selectedYear.update(y => y - 1);
    } else {
      this.selectedMonth.update(m => m - 1);
    }
    this.loadBudgetForPeriod();
  }

  goToNextMonth(): void {
    if (this.selectedMonth() === 12) {
      this.selectedMonth.set(1);
      this.selectedYear.update(y => y + 1);
    } else {
      this.selectedMonth.update(m => m + 1);
    }
    this.loadBudgetForPeriod();
  }

  goToCurrentMonth(): void {
    this.selectedMonth.set(new Date().getMonth() + 1);
    this.selectedYear.set(new Date().getFullYear());
    this.loadCurrentBudget();
  }

  loadBudgetForPeriod(): void {
    // Buscar presupuesto para el período seleccionado
    const budget = this.budgets().find(
      b => b.month === this.selectedMonth() && b.year === this.selectedYear()
    );

    if (budget) {
      this.budgetService.getBudgetById(budget.id).subscribe({
        next: (fullBudget) => {
          this.budgetService.currentBudget.set(fullBudget);
          this.loadBudgetProgress(fullBudget.id);
        }
      });
    } else {
      this.budgetService.currentBudget.set(null);
      this.budgetService.currentProgress.set(null);
    }
  }

  // ============================================
  // ACTIONS
  // ============================================

  deleteBudget(): void {
    const budget = this.currentBudget();
    if (!budget) return;

    if (confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) {
      this.budgetService.deleteBudget(budget.id).subscribe({
        next: () => {
          console.log('Presupuesto eliminado exitosamente');
          this.loadCurrentBudget();
          this.loadBudgets();
        },
        error: (err) => {
          console.error('Error deleting budget:', err);
        }
      });
    }
  }

  async copyPreviousMonthBudget(): Promise<void> {
    // Calcular mes anterior
    let prevMonth = this.selectedMonth() - 1;
    let prevYear = this.selectedYear();
    
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }

    // Buscar presupuesto del mes anterior
    const prevBudget = this.budgets().find(
      b => b.month === prevMonth && b.year === prevYear
    );

    if (!prevBudget) {
      alert(`No existe presupuesto para ${MONTH_NAMES[prevMonth]} ${prevYear}`);
      return;
    }

    // Copiar presupuesto
    this.budgetService.copyBudget(prevBudget.id, {
      target_month: this.selectedMonth(),
      target_year: this.selectedYear()
    }).subscribe({
      next: (newBudget) => {
        console.log('Presupuesto copiado exitosamente');
        this.budgetService.currentBudget.set(newBudget);
        this.loadBudgetProgress(newBudget.id);
        this.loadBudgets();
      },
      error: (err) => {
        console.error('Error copying budget:', err);
        alert('Error al copiar presupuesto');
      }
    });
  }

  // ============================================
  // HELPERS
  // ============================================

  getStatusColor(status: 'ok' | 'warning' | 'over'): string {
    return this.budgetService.getStatusColor(status);
  }

  getStatusLabel(status: 'ok' | 'warning' | 'over'): string {
    return this.budgetService.getStatusLabel(status);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatPercent(percent: number): string {
    return `${percent.toFixed(1)}%`;
  }

  // ============================================
  // EDIT BUDGET ITEM MODAL
  // ============================================

  handleEditBudgetItem(item: any): void {
    console.log('🖊️ Abriendo modal de edición para item:', item);
    
    this.itemToEdit.set({
      id: item.id,
      category_id: item.category_id,
      category_name: item.category_name,
      allocated_amount: Number(item.allocated_amount),
      notes: item.notes || ''
    });
    
    this.showEditItemModal.set(true);
  }

  onCloseEditItemModal(): void {
    this.showEditItemModal.set(false);
    this.itemToEdit.set(null);
  }

  onBudgetItemUpdated(): void {
    console.log('✅ Budget item actualizado, recargando datos...');
    this.showEditItemModal.set(false);
    this.itemToEdit.set(null);
    
    // Recargar progreso del presupuesto
    const budget = this.currentBudget();
    if (budget) {
      this.loadBudgetProgress(budget.id);
    }
  }

  // ============================================
  // MANAGE CATEGORIES MODAL
  // ============================================

  openManageCategoriesModal(): void {
    this.showManageCategoriesModal.set(true);
  }

  onCloseManageCategoriesModal(): void {
    this.showManageCategoriesModal.set(false);
  }

  onCategoriesUpdated(): void {
    console.log('✅ Categorías actualizadas, recargando...');
    this.loadCategories();
    
    // Si estamos en modo creación/edición, actualizar la lista
    if (this.viewMode() === 'create' || this.viewMode() === 'edit') {
      // Las categorías disponibles se actualizarán automáticamente
    }
  }
}
