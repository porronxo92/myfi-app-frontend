import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { AccountService } from '../../core/services/account.service';
import { Transaction } from '../../core/models/transaction.model';
import { Category } from '../../core/models/category.model';
import { Account } from '../../core/models/account.model';
import { TransactionModalComponent, TransactionModalConfig } from '../../shared/components/transaction-modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { EditTransactionModalComponent } from '../../shared/components/edit-transaction-modal.component';

// Importar componentes de la página
import { TransactionHeaderComponent } from './components/transaction-header.component';
import { TransactionKpisComponent } from './components/transaction-kpis.component';
import { TransactionFiltersSidebarComponent } from './components/transaction-filters-sidebar.component';
import { TransactionTableComponent } from './components/transaction-table.component';
import { CategoryDonutChartComponent } from './components/category-donut-chart.component';

interface CategoryData {
  category: string;
  total: number;
  color: string;
}

export interface TransactionFilters {
  search?: string;
  categoryIds?: string[];
  type?: 'income' | 'expense' | null;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  accountId?: string;
  selectedMonth?: number;
  selectedYear?: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    TransactionHeaderComponent,
    TransactionKpisComponent,
    TransactionFiltersSidebarComponent,
    TransactionTableComponent,
    TransactionModalComponent,
    ConfirmModalComponent,
    CategoryDonutChartComponent,
    EditTransactionModalComponent
  ],
  template: `
    <div class="transactions-layout">
      <app-navbar></app-navbar>

      <main class="main-content">
        <!-- Cabecera -->
        <app-transaction-header
          (uploadStatement)="handleUploadStatement()"
          (newTransaction)="handleNewTransaction()"
          (transfer)="handleTransfer()"
        ></app-transaction-header>

        <!-- Loading State -->
        <div class="loading-container" *ngIf="loading()">
          <div class="spinner"></div>
          <p>Cargando transacciones...</p>
        </div>

        <!-- Error State -->
        <div class="error-container" *ngIf="error()">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="error-message">{{ error() }}</p>
          <button class="btn-retry" (click)="loadData()">Reintentar</button>
        </div>

        <!-- Contenido con Layout Grid -->
        <div class="content-grid" *ngIf="!loading() && !error()">
          <!-- Sidebar Izquierdo: Filtros (25%) -->
          <aside class="sidebar-filters">
            <app-transaction-filters
              [categories]="categories()"
              [accounts]="accounts()"
              [activeFilters]="activeFilters()"
              (filtersChange)="handleFiltersChange($event)"
              (clearFilters)="handleClearFilters()"
            ></app-transaction-filters>
          </aside>

          <!-- Contenido Principal: KPIs + Tabla (75%) -->
          <div class="main-content-area">
            <!-- KPIs + Donut Chart en Grid -->
            <div class="kpis-and-chart-container">
              <!-- KPIs Simplificados -->
              <app-transaction-kpis
                [totalTransactions]="filteredTransactions().length"
                [balance]="balance()"
                [monthlyIncome]="monthlyIncome()"
                [monthlyExpenses]="monthlyExpenses()"
                [balanceVariation]="balanceVariation()"
                [selectedMonth]="selectedMonth()"
                [selectedYear]="selectedYear()"
              ></app-transaction-kpis>

              <!-- Gráfico Donut -->
              <app-category-donut-chart
                [incomeData]="incomeByCategory()"
                [expenseData]="expenseByCategory()"
              ></app-category-donut-chart>
            </div>

            <!-- Tabla -->
            <app-transaction-table
              [transactions]="paginatedTransactions()"
              [total]="filteredTransactions().length"
              [page]="currentPage()"
              [pageSize]="pageSize()"
              [sortField]="sortField()"
              [sortDirection]="sortDirection()"
              [accounts]="accounts()"
              (pageChange)="handlePageChange($event)"
              (sortChange)="handleSort($event)"
              (editTransaction)="handleEditTransaction($event)"
              (deleteTransaction)="handleDeleteTransaction($event)"
            ></app-transaction-table>
          </div>
        </div>

        <!-- Transaction Modal -->
        <app-transaction-modal
          *ngIf="showTransactionModal()"
          [config]="transactionModalConfig()!"
          (closeModal)="closeTransactionModal()"
          (transactionCreated)="onTransactionCreated($event)"
        ></app-transaction-modal>

        <!-- Confirm Delete Modal -->
        <app-confirm-modal
          *ngIf="showConfirmDelete()"
          [title]="'Eliminar transacción'"
          [message]="'¿Estás seguro de que quieres eliminar esta transacción?'"
          [submessage]="'Esta acción no se puede deshacer.'"
          [confirmText]="'Eliminar'"
          [cancelText]="'Cancelar'"
          [type]="'danger'"
          (confirm)="confirmDelete()"
          (cancel)="cancelDelete()"
        ></app-confirm-modal>

        <!-- Edit Transaction Modal -->
        <app-edit-transaction-modal
          *ngIf="showEditModal()"
          [transaction]="transactionToEdit()!"
          (closeModal)="closeEditModal()"
          (transactionUpdated)="onTransactionUpdated($event)"
        ></app-edit-transaction-modal>
      </main>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .transactions-layout {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .main-content {
      max-width: 1600px;
      margin: 0 auto;
      padding: var(--space-6);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-6);
      align-items: start;
    }

    .sidebar-filters {
      position: sticky;
      top: var(--space-6);
    }

    .main-content-area {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .kpis-and-chart-container {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--space-5);
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .sidebar-filters {
        position: static;
      }

      .kpis-and-chart-container {
        grid-template-columns: 1fr;
      }
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      text-align: center;
    }

    .spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 2px solid var(--bg-hover);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon {
      width: 3rem;
      height: 3rem;
      color: var(--color-negative);
      margin-bottom: var(--space-4);
    }

    .error-message {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin: var(--space-2) 0 var(--space-5);
    }

    .btn-retry {
      padding: var(--space-3) var(--space-5);
      background: var(--color-accent);
      color: var(--color-slate-950);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: background 100ms ease;
    }

    .btn-retry:hover {
      background: var(--color-accent-hover);
    }
  `]
})
export class TransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  // State
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  transactions = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);
  accounts = signal<Account[]>([]);
  
  activeFilters = signal<TransactionFilters>({});
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  
  // Period state (para mostrar en KPIs)
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());
  
  // Sorting state
  sortField = signal<'date' | 'amount' | null>(null);
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Modal state
  showTransactionModal = signal<boolean>(false);
  transactionModalConfig = signal<TransactionModalConfig | null>(null);

  // Confirm delete modal state
  showConfirmDelete = signal<boolean>(false);
  transactionToDelete = signal<Transaction | null>(null);

  // Edit modal state
  showEditModal = signal<boolean>(false);
  transactionToEdit = signal<Transaction | null>(null);

  // Computed
  filteredTransactions = computed(() => {
    let filtered = this.transactions();
    const filters = this.activeFilters();

    // Aplicar filtros
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(search)
      );
    }

    if (filters.type) {
      filtered = filtered.filter(t => 
        (t.type || t.transaction_type) === filters.type
      );
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filtered = filtered.filter(t => 
        t.category_id && filters.categoryIds!.includes(t.category_id)
      );
    }

    if (filters.accountId) {
      filtered = filtered.filter(t => t.account_id === filters.accountId);
    }

    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(t => Math.abs(t.amount) >= filters.amountMin!);
    }

    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(t => Math.abs(t.amount) <= filters.amountMax!);
    }

    // Los filtros de fecha (dateFrom/dateTo) ya están aplicados en el backend
    // cuando se cargan las transacciones del periodo seleccionado

    // Ordenar según el campo seleccionado
    const sortField = this.sortField();
    const sortDir = this.sortDirection();
    
    return filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortField === 'date') {
        const dateA = new Date(a.date || a.transaction_date || '').getTime();
        const dateB = new Date(b.date || b.transaction_date || '').getTime();
        compareValue = dateB - dateA;
      } else if (sortField === 'amount') {
        compareValue = Math.abs(b.amount) - Math.abs(a.amount);
      } else {
        // Por defecto: fecha descendente (más recientes primero)
        const dateA = new Date(a.date || a.transaction_date || '').getTime();
        const dateB = new Date(b.date || b.transaction_date || '').getTime();
        compareValue = dateB - dateA;
      }
      
      return sortDir === 'desc' ? compareValue : -compareValue;
    });
  });

  paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredTransactions().slice(start, end);
  });

  // KPIs calculados
  monthlyIncome = computed(() => {
    const filterMonth = this.selectedMonth() - 1; // getMonth() retorna 0-11
    const filterYear = this.selectedYear();

    return this.filteredTransactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === filterMonth && 
               date.getFullYear() === filterYear &&
               type === 'income';
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  monthlyExpenses = computed(() => {
    const filterMonth = this.selectedMonth() - 1; // getMonth() retorna 0-11
    const filterYear = this.selectedYear();

    return this.filteredTransactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === filterMonth && 
               date.getFullYear() === filterYear &&
               type === 'expense';
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  balance = computed(() => this.monthlyIncome() - this.monthlyExpenses());
  
  // Balance del mes anterior
  previousMonthBalance = computed(() => {
    const now = new Date();
    const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    const income = this.transactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === previousMonth && 
               date.getFullYear() === previousYear &&
               type === 'income';
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expenses = this.transactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === previousMonth && 
               date.getFullYear() === previousYear &&
               type === 'expense';
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return income - expenses;
  });

  balanceVariation = computed(() => {
    const current = this.balance();
    const previous = this.previousMonthBalance();
    
    if (previous === 0) return 0;
    
    return ((current - previous) / Math.abs(previous)) * 100;
  });

  // Datos por categoría para el gráfico donut
  incomeByCategory = computed(() => {
    const filterMonth = this.selectedMonth() - 1;
    const filterYear = this.selectedYear();
    
    const incomeTransactions = this.filteredTransactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === filterMonth && 
               date.getFullYear() === filterYear &&
               type === 'income';
      });

    return this.aggregateByCategory(incomeTransactions, '#10b981');
  });

  expenseByCategory = computed(() => {
    const filterMonth = this.selectedMonth() - 1;
    const filterYear = this.selectedYear();
    
    const expenseTransactions = this.filteredTransactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === filterMonth && 
               date.getFullYear() === filterYear &&
               type === 'expense';
      });

    return this.aggregateByCategory(expenseTransactions, '#ef4444');
  });

  private aggregateByCategory(transactions: Transaction[], defaultColor: string): CategoryData[] {
    const categoryMap = new Map<string, number>();
    
    transactions.forEach(t => {
      const categoryId = t.category_id;
      if (!categoryId) return;
      
      const amount = Math.abs(t.amount);
      const current = categoryMap.get(categoryId) || 0;
      categoryMap.set(categoryId, current + amount);
    });

    const categories = this.categories();
    const result: CategoryData[] = [];
    
    categoryMap.forEach((total, categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      const categoryName = category?.name || 'Sin categoría';
      
      result.push({
        category: categoryName,
        total: total,
        color: this.getCategoryColor(categoryName, defaultColor)
      });
    });

    // Ordenar por total descendente
    const sorted = result.sort((a, b) => b.total - a.total);
    
    return sorted;
  }

  private getCategoryColor(categoryName: string, defaultColor: string): string {
    // Colores predefinidos para categorías comunes
    const colorMap: { [key: string]: string } = {
      // Gastos
      'Alimentación': '#f97316',
      'Supermercado': '#fb923c',
      'Restaurantes': '#fdba74',
      'Transporte': '#3b82f6',
      'Gasolina': '#60a5fa',
      'Transporte público': '#93c5fd',
      'Vivienda': '#8b5cf6',
      'Alquiler': '#a78bfa',
      'Hipoteca': '#c4b5fd',
      'Servicios': '#06b6d4',
      'Luz': '#22d3ee',
      'Agua': '#67e8f9',
      'Internet': '#a5f3fc',
      'Teléfono': '#cffafe',
      'Entretenimiento': '#ec4899',
      'Ocio': '#f472b6',
      'Suscripciones': '#f9a8d4',
      'Salud': '#14b8a6',
      'Farmacia': '#2dd4bf',
      'Médico': '#5eead4',
      'Educación': '#f59e0b',
      'Compras': '#84cc16',
      'Ropa': '#a3e635',
      'Hogar': '#6366f1',
      
      // Ingresos
      'Salario': '#10b981',
      'Nómina': '#34d399',
      'Freelance': '#6ee7b7',
      'Inversiones': '#059669',
      'Alquiler recibido': '#047857',
      'Otros ingresos': '#065f46'
    };

    return colorMap[categoryName] || defaultColor;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(month?: number, year?: number): void {
    this.loading.set(true);
    this.error.set(null);

    // Usar el mes y año proporcionados o los actuales
    const filterMonth = month !== undefined ? month : this.selectedMonth();
    const filterYear = year !== undefined ? year : this.selectedYear();

    // Calcular dateFrom y dateTo para el mes seleccionado
    const monthStr = filterMonth.toString().padStart(2, '0');
    const lastDay = new Date(filterYear, filterMonth, 0).getDate();
    const dateFrom = `${filterYear}-${monthStr}-01`;
    const dateTo = `${filterYear}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;

    // Cargar transacciones del periodo específico
    this.transactionService.getTransactions({
      date_from: dateFrom,
      date_to: dateTo
    }).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las transacciones');
        this.loading.set(false);
        console.error('Error loading transactions');
      }
    });

    // Cargar todas las categorías disponibles (globales + del usuario)
    this.categoryService.getAllAvailableCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        console.error('Error loading categories');
      }
    });

    // Cargar cuentas
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
      },
      error: () => {
        console.error('Error loading accounts');
      }
    });
  }

  handleFiltersChange(filters: TransactionFilters): void {
    this.currentPage.set(1); // Reset a la primera página
    
    // Detectar si cambió el periodo (mes o año)
    const monthChanged = filters.selectedMonth !== undefined && filters.selectedMonth !== this.selectedMonth();
    const yearChanged = filters.selectedYear !== undefined && filters.selectedYear !== this.selectedYear();
    const periodChanged = monthChanged || yearChanged;
    
    // Si cambió el periodo, actualizar y recargar desde backend
    if (periodChanged) {
      if (filters.selectedMonth !== undefined) {
        this.selectedMonth.set(filters.selectedMonth);
      }
      if (filters.selectedYear !== undefined) {
        this.selectedYear.set(filters.selectedYear);
      }
      
      // Recargar transacciones con el nuevo periodo
      this.loadData(filters.selectedMonth, filters.selectedYear);
    }
    
    // Actualizar filtros (sin recargar transacciones)
    this.activeFilters.set(filters);
  }

  handleClearFilters(): void {
    const now = new Date();
    this.activeFilters.set({});
    this.currentPage.set(1);
    this.selectedMonth.set(now.getMonth() + 1);
    this.selectedYear.set(now.getFullYear());
    
    // Recargar transacciones del mes actual
    this.loadData(now.getMonth() + 1, now.getFullYear());
  }

  handlePageChange(page: number): void {
    this.currentPage.set(page);
  }

  handleUploadStatement(): void {
    this.router.navigate(['/transactions/upload']);
  }

  handleNewTransaction(): void {
    this.transactionModalConfig.set({
      mode: 'transaction'
    });
    this.showTransactionModal.set(true);
  }

  handleTransfer(): void {
    this.transactionModalConfig.set({
      mode: 'transfer'
    });
    this.showTransactionModal.set(true);
  }

  closeTransactionModal(): void {
    this.showTransactionModal.set(false);
  }

  onTransactionCreated(transaction: any): void {
    this.loadData();
  }

  handleSort(field: 'date' | 'amount'): void {
    if (this.sortField() === field) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to descending
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  handleEditTransaction(transaction: Transaction): void {
    this.transactionToEdit.set(transaction);
    this.showEditModal.set(true);
  }

  handleDeleteTransaction(transaction: Transaction): void {
    this.transactionToDelete.set(transaction);
    this.showConfirmDelete.set(true);
  }

  confirmDelete(): void {
    const transaction = this.transactionToDelete();
    if (!transaction) return;

    this.transactionService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        this.showConfirmDelete.set(false);
        this.transactionToDelete.set(null);
        this.loadData();
      },
      error: () => {
        console.error('Error al eliminar transacción');
        alert('Error al eliminar la transacción');
        this.showConfirmDelete.set(false);
        this.transactionToDelete.set(null);
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmDelete.set(false);
    this.transactionToDelete.set(null);
  }
  
  closeEditModal(): void {
    this.showEditModal.set(false);
    this.transactionToEdit.set(null);
  }
  
  onTransactionUpdated(transaction: Transaction): void {
    this.showEditModal.set(false);
    this.transactionToEdit.set(null);
    this.loadData(this.selectedMonth(), this.selectedYear());
  }
}
