import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { Account } from '../../../core/models/account.model';
import { TransactionFilters } from '../transactions.component';

@Component({
  selector: 'app-transaction-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sidebar-filters">
      <div class="sidebar-header">
        <h3>🔍 Filtros</h3>
        <button *ngIf="hasActiveFilters()" class="btn-reset" (click)="resetFilters()">
          Limpiar
        </button>
      </div>

      <!-- Búsqueda de texto -->
      <div class="filter-group">
        <label>Buscar</label>
        <input 
          type="text" 
          class="filter-input"
          placeholder="Buscar..."
          [(ngModel)]="searchText"
          (ngModelChange)="applyFilters()"
        />
      </div>

      <!-- Período Temporal -->
      <div class="filter-group">
        <label>Período</label>
        <div class="period-selects">
          <select 
            class="filter-select period-select"
            [(ngModel)]="selectedMonth"
            (ngModelChange)="onPeriodChange()"
          >
            <option *ngFor="let month of monthsList" [ngValue]="month.value">
              {{ month.label }}
            </option>
          </select>
          <select 
            class="filter-select period-select"
            [(ngModel)]="selectedYear"
            (ngModelChange)="onPeriodChange()"
          >
            <option *ngFor="let year of yearsList" [ngValue]="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <!-- Cuenta -->
      <div class="filter-group">
        <label>Cuenta</label>
        <select 
          class="filter-select"
          [(ngModel)]="selectedAccount"
          (ngModelChange)="applyFilters()"
        >
          <option [ngValue]="null">Todas</option>
          <option *ngFor="let account of accounts()" [ngValue]="account.id">
            {{ account.account_name || account.name }}
          </option>
        </select>
      </div>

      <!-- Tipo -->
      <div class="filter-group">
        <label>Tipo</label>
        <div class="type-buttons">
          <button 
            class="type-btn" 
            [class.active]="selectedType === null"
            (click)="setType(null)">
            Todos
          </button>
          <button 
            class="type-btn income" 
            [class.active]="selectedType === 'income'"
            (click)="setType('income')">
            Ingresos
          </button>
          <button 
            class="type-btn expense" 
            [class.active]="selectedType === 'expense'"
            (click)="setType('expense')">
            Gastos
          </button>
        </div>
      </div>

      <!-- Categorías (Ingresos) -->
      <div class="filter-group" *ngIf="incomeCategories().length > 0">
        <label>Categorías de Ingresos</label>
        <div class="category-list">
          <label *ngFor="let cat of incomeCategories()" class="category-checkbox">
            <input 
              type="checkbox"
              [checked]="selectedCategories().includes(cat.id)"
              (change)="toggleCategory(cat.id)"
            />
            <span>{{ cat.name }}</span>
          </label>
        </div>
      </div>

      <!-- Categorías (Gastos) -->
      <div class="filter-group" *ngIf="expenseCategories().length > 0">
        <label>Categorías de Gastos</label>
        <div class="category-list">
          <label *ngFor="let cat of expenseCategories()" class="category-checkbox">
            <input 
              type="checkbox"
              [checked]="selectedCategories().includes(cat.id)"
              (change)="toggleCategory(cat.id)"
            />
            <span>{{ cat.name }}</span>
          </label>
        </div>
      </div>

      <!-- Rango de Importes -->
      <div class="filter-group">
        <label>Rango de Importe (€)</label>
        <div class="amount-inputs">
          <input 
            type="number" 
            class="filter-input"
            placeholder="Mínimo"
            [(ngModel)]="amountMin"
            (ngModelChange)="applyFilters()"
            min="0"
            step="0.01"
          />
          <span class="amount-separator">-</span>
          <input 
            type="number" 
            class="filter-input"
            placeholder="Máximo"
            [(ngModel)]="amountMax"
            (ngModelChange)="applyFilters()"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-filters {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      padding: var(--space-5);
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-5);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-slate-600);
    }

    .sidebar-header h3 {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .btn-reset {
      padding: var(--space-2) var(--space-3);
      background: transparent;
      color: var(--color-negative);
      border: 1px solid var(--color-negative);
      border-radius: var(--radius-md);
      font-size: 0.6875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 100ms ease;
    }

    .btn-reset:hover {
      background: var(--color-negative);
      color: white;
    }

    .filter-group {
      margin-bottom: var(--space-5);
    }

    .filter-group label {
      display: block;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: var(--space-2);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-input,
    .filter-select {
      width: 100%;
      padding: var(--space-3);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-family: var(--font-ui);
      color: var(--text-primary);
      transition: border-color 100ms ease;
      box-sizing: border-box;
    }

    .filter-input::placeholder {
      color: var(--text-muted);
    }

    .filter-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .filter-select option {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .date-inputs,
    .amount-inputs,
    .period-selects {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .period-select {
      flex: 1;
    }

    .date-separator,
    .amount-separator {
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.75rem;
    }

    .type-buttons {
      display: flex;
      gap: var(--space-2);
    }

    .type-btn {
      flex: 1;
      padding: var(--space-3);
      border: var(--border-subtle);
      background: var(--bg-elevated);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 100ms ease;
    }

    .type-btn:hover {
      border-color: var(--color-slate-500);
      color: var(--text-primary);
    }

    .type-btn.active {
      background: var(--color-accent);
      color: var(--color-slate-900);
      border-color: var(--color-accent);
    }

    .type-btn.income.active {
      background: var(--color-positive);
      border-color: var(--color-positive);
      color: white;
    }

    .type-btn.expense.active {
      background: var(--color-negative);
      border-color: var(--color-negative);
      color: white;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      max-height: 200px;
      overflow-y: auto;
      padding: var(--space-2);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
    }

    .category-list::-webkit-scrollbar {
      width: 4px;
    }

    .category-list::-webkit-scrollbar-thumb {
      background: var(--color-slate-500);
      border-radius: 2px;
    }

    .category-checkbox {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 100ms ease;
    }

    .category-checkbox:hover {
      background: var(--bg-card);
    }

    .category-checkbox input[type="checkbox"] {
      cursor: pointer;
      accent-color: var(--color-accent);
    }

    .category-checkbox span {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    @media (max-width: 1024px) {
      .sidebar-filters {
        margin-bottom: var(--space-5);
      }
    }
  `]
})
export class TransactionFiltersSidebarComponent implements OnInit {
  categories = input.required<Category[]>();
  accounts = input.required<Account[]>();
  activeFilters = input.required<TransactionFilters>();

  filtersChange = output<TransactionFilters>();
  clearFilters = output<void>();

  // Estado interno
  searchText = '';
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  selectedAccount: string | null = null;
  selectedType: 'income' | 'expense' | null = null;
  selectedCategories = signal<string[]>([]);
  amountMin: number | undefined;
  amountMax: number | undefined;

  incomeCategories = signal<Category[]>([]);
  expenseCategories = signal<Category[]>([]);

  // Lista de meses
  monthsList = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  // Lista de años (desde el año actual hasta 10 años atrás)
  yearsList: number[] = [];

  constructor() {
    // Generar lista de años (actual hasta 10 años atrás)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 10; i++) {
      this.yearsList.push(currentYear - i);
    }
  }

  ngOnInit() {
    // Filtrar categorías
    const cats = this.categories();
    this.incomeCategories.set(cats.filter(c => (c.type || c.category_type) === 'income'));
    this.expenseCategories.set(cats.filter(c => (c.type || c.category_type) === 'expense'));
    
    // Sincronizar con los filtros activos del padre
    const filters = this.activeFilters();
    if (filters.selectedMonth !== undefined) {
      this.selectedMonth = filters.selectedMonth;
    } else {
      // Solo si no hay filtros activos, usar fecha actual
      this.selectedMonth = new Date().getMonth() + 1;
    }
    if (filters.selectedYear !== undefined) {
      this.selectedYear = filters.selectedYear;
    } else {
      this.selectedYear = new Date().getFullYear();
    }
    
    // Sincronizar otros filtros
    if (filters.search) this.searchText = filters.search;
    if (filters.type) this.selectedType = filters.type;
    if (filters.accountId) this.selectedAccount = filters.accountId;
    if (filters.amountMin !== undefined) this.amountMin = filters.amountMin;
    if (filters.amountMax !== undefined) this.amountMax = filters.amountMax;
    if (filters.categoryIds) this.selectedCategories.set(filters.categoryIds);
  }

  setType(type: 'income' | 'expense' | null): void {
    this.selectedType = type;
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

  onPeriodChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    // Calcular dateFrom y dateTo basándose en mes y año seleccionados
    const year = this.selectedYear;
    const month = this.selectedMonth.toString().padStart(2, '0');
    const lastDay = new Date(year, this.selectedMonth, 0).getDate();
    dateFrom = `${year}-${month}-01`;
    dateTo = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;

    const filters: TransactionFilters = {
      search: this.searchText || undefined,
      type: this.selectedType || undefined,
      categoryIds: this.selectedCategories().length > 0 ? this.selectedCategories() : undefined,
      dateFrom: dateFrom,
      dateTo: dateTo,
      amountMin: this.amountMin,
      amountMax: this.amountMax,
      accountId: this.selectedAccount || undefined,
      selectedMonth: this.selectedMonth,
      selectedYear: this.selectedYear
    };

    this.filtersChange.emit(filters);
  }

  hasActiveFilters(): boolean {
    const now = new Date();
    const isDefaultPeriod = this.selectedMonth === (now.getMonth() + 1) && 
                           this.selectedYear === now.getFullYear();

    return !!this.searchText ||
           !!this.selectedType ||
           this.selectedCategories().length > 0 ||
           !isDefaultPeriod ||
           this.amountMin !== undefined ||
           this.amountMax !== undefined ||
           !!this.selectedAccount;
  }

  resetFilters(): void {
    const now = new Date();
    this.searchText = '';
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    this.selectedAccount = null;
    this.selectedType = null;
    this.selectedCategories.set([]);
    this.amountMin = undefined;
    this.amountMax = undefined;
    
    this.clearFilters.emit();
  }
}
