import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { AccountService } from '../../core/services/account.service';
import { Transaction } from '../../core/models/transaction.model';
import { Category } from '../../core/models/category.model';
import { Account } from '../../core/models/account.model';
import { TransactionModalComponent, TransactionModalConfig } from '../../shared/components/transaction-modal.component';

// Importar componentes de la página
import { TransactionHeaderComponent } from './components/transaction-header.component';
import { TransactionKpisComponent } from './components/transaction-kpis.component';
import { TransactionFiltersComponent } from './components/transaction-filters.component';
import { TransactionChartsComponent } from './components/transaction-charts.component';
import { TransactionTableComponent } from './components/transaction-table.component';

export interface TransactionFilters {
  search?: string;
  categoryIds?: string[];
  type?: 'income' | 'expense' | null;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  accountId?: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    TransactionHeaderComponent,
    TransactionKpisComponent,
    TransactionFiltersComponent,
    TransactionChartsComponent,
    TransactionTableComponent,
    TransactionModalComponent
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

        <!-- Contenido -->
        <div class="content-body" *ngIf="!loading() && !error()">
          <!-- Tarjetas KPI -->
          <app-transaction-kpis
            [balance]="balance()"
            [monthlyIncome]="monthlyIncome()"
            [monthlyExpenses]="monthlyExpenses()"
            [balanceVariation]="balanceVariation()"
          ></app-transaction-kpis>

          <!-- Gráficos (antes de filtros, no afectados por filtros) -->
          <app-transaction-charts
            [transactions]="transactions()"
            [categories]="categories()"
          ></app-transaction-charts>

          <!-- Filtros -->
          <app-transaction-filters
            [categories]="categories()"
            [accounts]="accounts()"
            [activeFilters]="activeFilters()"
            (filtersChange)="handleFiltersChange($event)"
            (clearFilters)="handleClearFilters()"
          ></app-transaction-filters>

          <!-- Tabla -->
          <app-transactions-table-wrapper
            [transactions]="paginatedTransactions()"
            [total]="filteredTransactions().length"
            [page]="currentPage()"
            [pageSize]="pageSize()"
            (pageChange)="handlePageChange($event)"
            (editTransaction)="handleEditTransaction($event)"
            (deleteTransaction)="handleDeleteTransaction($event)"
          ></app-transactions-table-wrapper>
        </div>

        <!-- Transaction Modal -->
        <app-transaction-modal
          *ngIf="showTransactionModal()"
          [config]="transactionModalConfig()!"
          (closeModal)="closeTransactionModal()"
          (transactionCreated)="onTransactionCreated($event)"
        ></app-transaction-modal>
      </main>
    </div>
  `,
  styles: [`
    .transactions-layout {
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .content-body {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon {
      width: 64px;
      height: 64px;
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .error-message {
      color: #64748b;
      font-size: 1.125rem;
      margin: 0.5rem 0 1.5rem;
    }

    .btn-retry {
      padding: 0.75rem 1.5rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-retry:hover {
      background-color: #2563eb;
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

  // Modal state
  showTransactionModal = signal<boolean>(false);
  transactionModalConfig = signal<TransactionModalConfig | null>(null);

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

    if (filters.dateFrom) {
      filtered = filtered.filter(t => {
        const date = t.date || t.transaction_date || '';
        return date >= filters.dateFrom!;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => {
        const date = t.date || t.transaction_date || '';
        return date <= filters.dateTo!;
      });
    }

    // Ordenar por fecha descendente (más recientes primero)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.transaction_date || '').getTime();
      const dateB = new Date(b.date || b.transaction_date || '').getTime();
      return dateB - dateA;
    });
  });

  paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredTransactions().slice(start, end);
  });

  // KPIs calculados
  monthlyIncome = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.filteredTransactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               type === 'income';
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  monthlyExpenses = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.filteredTransactions()
      .filter(t => {
        const date = new Date(t.date || t.transaction_date || '');
        const type = t.type || t.transaction_type;
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               type === 'expense';
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  balance = computed(() => this.monthlyIncome() - this.monthlyExpenses());

  balanceVariation = computed(() => {
    // TODO: Calcular variación real comparando con mes anterior
    // Por ahora retornamos un valor mock
    return 5.2;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Cargar transacciones
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las transacciones');
        this.loading.set(false);
        console.error('Error loading transactions:', err);
      }
    });

    // Cargar categorías (solo las que tienen transacciones)
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });

    // Cargar cuentas
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
      }
    });
  }

  handleFiltersChange(filters: TransactionFilters): void {
    this.activeFilters.set(filters);
    this.currentPage.set(1); // Reset a la primera página
  }

  handleClearFilters(): void {
    this.activeFilters.set({});
    this.currentPage.set(1);
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
    console.log('✅ Transacción/Transferencia creada:', transaction);
    this.loadData();
  }

  handleEditTransaction(transaction: Transaction): void {
    // TODO: Implementar edición
    console.log('Editar transacción:', transaction);
  }

  handleDeleteTransaction(transaction: Transaction): void {
    // TODO: Implementar eliminación
    console.log('Eliminar transacción:', transaction);
  }
}
