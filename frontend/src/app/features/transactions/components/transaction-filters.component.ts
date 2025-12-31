import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Category } from '../../../core/models/category.model';
import { Account } from '../../../core/models/account.model';
import { TransactionFilters } from '../transactions.component';

interface FilterChip {
  key: string;
  label: string;
  value: any;
}

@Component({
  selector: 'app-transaction-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatChipsModule],
  template: `
    <div class="filters-container">
      <!-- Header -->
      <div class="filters-header">
        <h3 class="filters-title">
          <mat-icon>filter_list</mat-icon>
          Filtros
        </h3>
        <div class="header-actions">
          <!-- Botón limpiar filtros (solo si hay filtros activos) -->
          <button 
            *ngIf="hasActiveFilters()" 
            class="btn-clear-icon" 
            (click)="clearAllFilters()"
            title="Limpiar todos los filtros"
          >
            <mat-icon>delete_outline</mat-icon>
          </button>
          <!-- Botón toggle -->
          <button class="btn-toggle" (click)="toggleAdvancedFilters()">
            <mat-icon>{{ showAdvancedFilters() ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Filtros expandidos -->
      <div class="advanced-filters" *ngIf="showAdvancedFilters()">
        <!-- Búsqueda y Cuenta en la misma fila -->
        <div class="search-account-row">
          <!-- Búsqueda con chips -->
          <div class="filter-section">
            <label class="filter-label">
              <mat-icon class="label-icon">search</mat-icon>
              Buscar
            </label>
            <div class="search-container">
              <input 
                type="text" 
                class="search-input" 
                placeholder="Escribe y presiona Enter..."
                [(ngModel)]="searchInput"
                (keydown.enter)="addSearchKeyword()"
              />
              <mat-chip-set aria-label="Palabras clave">
                <mat-chip 
                  *ngFor="let keyword of searchKeywords()" 
                  (removed)="removeSearchKeyword(keyword)"
                  [removable]="true"
                >
                  {{ keyword }}
                  <button matChipRemove>
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>

          <!-- Cuenta -->
          <div class="filter-section">
            <label class="filter-label">
              <mat-icon class="label-icon">account_balance</mat-icon>
              Cuenta
            </label>
            <select 
              class="account-select" 
              [(ngModel)]="selectedAccount"
              (ngModelChange)="applyFilters()"
            >
              <option [ngValue]="null">Todas las cuentas</option>
              <option *ngFor="let account of accounts()" [ngValue]="account.id">
                {{ account.account_name || account.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tipo de transacción -->
        <div class="filter-section">
          <label class="filter-label">
            <mat-icon class="label-icon">swap_vert</mat-icon>
            Tipo
          </label>
          <div class="type-buttons">
            <button 
              class="type-btn" 
              [class.active]="quickFilter() === 'all'"
              (click)="setQuickFilter('all')"
            >
              <mat-icon>all_inclusive</mat-icon>
              Todos
            </button>
            <button 
              class="type-btn income" 
              [class.active]="quickFilter() === 'income'"
              (click)="setQuickFilter('income')"
            >
              <mat-icon>arrow_upward</mat-icon>
              Ingresos
            </button>
            <button 
              class="type-btn expense" 
              [class.active]="quickFilter() === 'expense'"
              (click)="setQuickFilter('expense')"
            >
              <mat-icon>arrow_downward</mat-icon>
              Gastos
            </button>
          </div>
        </div>

        <!-- Categorías visuales divididas por tipo -->
        <div class="filter-section full-width">
          <label class="filter-label">
            <mat-icon class="label-icon">category</mat-icon>
            Categorías
          </label>
          
          <!-- Categorías de Gastos -->
          <div class="categories-group" *ngIf="expenseCategories().length > 0">
            <div class="group-header">
              <mat-icon class="group-icon expense">trending_down</mat-icon>
              <span>Gastos</span>
            </div>
            <div class="categories-grid">
              <button
                *ngFor="let category of expenseCategories()"
                class="category-card"
                [class.selected]="selectedCategories().includes(category.id)"
                (click)="toggleCategory(category.id)"
                [style.--category-color]="category.color"
              >
                <div class="category-indicator"></div>
                <span class="category-name">{{ category.name }}</span>
              </button>
            </div>
          </div>

          <!-- Categorías de Ingresos -->
          <div class="categories-group" *ngIf="incomeCategories().length > 0">
            <div class="group-header">
              <mat-icon class="group-icon income">trending_up</mat-icon>
              <span>Ingresos</span>
            </div>
            <div class="categories-grid">
              <button
                *ngFor="let category of incomeCategories()"
                class="category-card"
                [class.selected]="selectedCategories().includes(category.id)"
                (click)="toggleCategory(category.id)"
                [style.--category-color]="category.color"
              >
                <div class="category-indicator"></div>
                <span class="category-name">{{ category.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Fila de filtros de fechas e importe -->
        <div class="filters-row">
          <!-- Rango de fechas -->
          <div class="filter-section">
            <label class="filter-label">
              <mat-icon class="label-icon">date_range</mat-icon>
              Fechas
            </label>
            <div class="date-range">
              <input 
                type="date" 
                class="date-input" 
                [(ngModel)]="dateFrom"
                (ngModelChange)="applyFilters()"
                placeholder="Desde"
              />
              <span class="range-separator">—</span>
              <input 
                type="date" 
                class="date-input" 
                [(ngModel)]="dateTo"
                (ngModelChange)="applyFilters()"
                placeholder="Hasta"
              />
            </div>
          </div>

          <!-- Rango de importe -->
          <div class="filter-section">
            <label class="filter-label">
              <mat-icon class="label-icon">euro</mat-icon>
              Importe
            </label>
            <div class="amount-range">
              <input 
                type="number" 
                class="amount-input" 
                placeholder="Mínimo"
                [(ngModel)]="amountMin"
                (ngModelChange)="applyFilters()"
              />
              <span class="range-separator">—</span>
              <input 
                type="number" 
                class="amount-input" 
                placeholder="Máximo"
                [(ngModel)]="amountMax"
                (ngModelChange)="applyFilters()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      background: white;
      border-radius: 16px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .filters-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .filters-title mat-icon {
      color: #3b82f6;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-clear-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #fecaca;
      background: white;
      border-radius: 8px;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear-icon:hover {
      background: #fef2f2;
      border-color: #ef4444;
    }

    .btn-clear-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .btn-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-toggle:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .advanced-filters {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-top: 1.5rem;
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    /* Fila superior: Búsqueda y Cuenta */
    .search-account-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .filter-section.full-width {
      width: 100%;
    }

    /* Grid para campos de filtro en fila (fechas e importe) */
    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .filter-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    .label-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #64748b;
    }

    /* Búsqueda con chips */
    .search-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .search-input {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9375rem;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    mat-chip-set {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    mat-chip {
      --mdc-chip-elevated-container-color: #eff6ff;
      --mdc-chip-label-text-color: #3b82f6;
      border: 1px solid #dbeafe !important;
    }

    /* Botones de tipo */
    .type-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .type-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      color: #64748b;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .type-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .type-btn.active {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-color: transparent;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }

    .type-btn.income.active {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .type-btn.expense.active {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    /* Categorías visuales */
    .categories-group {
      margin-bottom: 1.5rem;
    }

    .categories-group:last-child {
      margin-bottom: 0;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    .group-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .group-icon.income {
      color: #10b981;
    }

    .group-icon.expense {
      color: #ef4444;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.5rem;
    }

    .category-card {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .category-card:hover {
      background: #f8fafc;
      border-color: var(--category-color, #cbd5e1);
    }

    .category-card.selected {
      background: var(--category-color, #3b82f6);
      color: white;
      border-color: var(--category-color, #3b82f6);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .category-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--category-color, #94a3b8);
      flex-shrink: 0;
    }

    .category-card.selected .category-indicator {
      background: white;
    }

    .category-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Rangos */
    .date-range,
    .amount-range {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .range-separator {
      color: #94a3b8;
      font-weight: 500;
    }

    .date-input,
    .amount-input,
    .account-select {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9375rem;
      color: #0f172a;
      transition: border-color 0.2s;
    }

    .date-input:focus,
    .amount-input:focus,
    .account-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .search-account-row {
        grid-template-columns: 1fr;
      }

      .filters-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .type-buttons {
        grid-template-columns: 1fr;
      }

      .categories-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }

      .date-range,
      .amount-range {
        flex-direction: column;
        align-items: stretch;
      }

      .range-separator {
        display: none;
      }
    }
  `]
})
export class TransactionFiltersComponent {
  categories = input.required<Category[]>();
  accounts = input.required<Account[]>();
  activeFilters = input.required<TransactionFilters>();
  
  filtersChange = output<TransactionFilters>();
  clearFilters = output<void>();

  // Estado interno
  showAdvancedFilters = signal<boolean>(false);
  quickFilter = signal<'all' | 'income' | 'expense'>('all');
  
  searchInput = '';
  searchKeywords = signal<string[]>([]);
  dateFrom = '';
  dateTo = '';
  selectedCategories = signal<string[]>([]);
  amountMin: number | undefined;
  amountMax: number | undefined;
  selectedAccount: string | null = null;

  // Computed: Categorías divididas por tipo
  incomeCategories = computed(() => 
    this.categories().filter(c => (c.type || c.category_type) === 'income')
  );

  expenseCategories = computed(() => 
    this.categories().filter(c => (c.type || c.category_type) === 'expense')
  );

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(v => !v);
  }

  setQuickFilter(filter: 'all' | 'income' | 'expense'): void {
    this.quickFilter.set(filter);
    this.applyFilters();
  }

  addSearchKeyword(): void {
    const keyword = this.searchInput.trim();
    if (keyword && !this.searchKeywords().includes(keyword)) {
      this.searchKeywords.update(keywords => [...keywords, keyword]);
      this.searchInput = '';
      this.applyFilters();
    }
  }

  removeSearchKeyword(keyword: string): void {
    this.searchKeywords.update(keywords => keywords.filter(k => k !== keyword));
    this.applyFilters();
  }

  toggleCategory(categoryId: string): void {
    const current = this.selectedCategories();
    if (current.includes(categoryId)) {
      this.selectedCategories.set(current.filter(id => id !== categoryId));
    } else {
      this.selectedCategories.set([...current, categoryId]);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    const filterType = this.quickFilter();
    
    // Combinar todas las keywords en una sola búsqueda
    const searchText = this.searchKeywords().join(' ');
    
    const filters: TransactionFilters = {
      search: searchText || undefined,
      type: filterType === 'all' ? undefined : filterType,
      categoryIds: this.selectedCategories().length > 0 ? this.selectedCategories() : undefined,
      dateFrom: this.dateFrom || undefined,
      dateTo: this.dateTo || undefined,
      amountMin: this.amountMin,
      amountMax: this.amountMax,
      accountId: this.selectedAccount || undefined
    };

    this.filtersChange.emit(filters);
  }

  hasActiveFilters(): boolean {
    return this.searchKeywords().length > 0 ||
           this.quickFilter() !== 'all' ||
           this.selectedCategories().length > 0 ||
           !!this.dateFrom ||
           !!this.dateTo ||
           this.amountMin !== undefined ||
           this.amountMax !== undefined ||
           !!this.selectedAccount;
  }

  clearAllFilters(): void {
    this.searchInput = '';
    this.searchKeywords.set([]);
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedCategories.set([]);
    this.amountMin = undefined;
    this.amountMax = undefined;
    this.selectedAccount = null;
    this.quickFilter.set('all');
    
    this.clearFilters.emit();
  }
}
