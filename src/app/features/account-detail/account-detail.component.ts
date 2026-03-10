import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { AccountDetailService } from './services/account-detail.service';
import { MaskIbanPipe } from '../../shared/pipes/mask-iban.pipe';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AccountHeaderComponent } from './components/account-header.component';
import { AccountBalanceCardComponent } from './components/account-balance-card.component';
import { AccountSummaryCardsComponent } from './components/account-summary-cards.component';
import { AccountTransactionsTableComponent } from './components/account-transactions-table.component';
import { TransactionModalComponent, TransactionModalConfig } from '../../shared/components/transaction-modal.component';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    MaskIbanPipe,
    NavbarComponent,
    AccountHeaderComponent,
    AccountBalanceCardComponent,
    AccountSummaryCardsComponent,
    AccountTransactionsTableComponent,
    TransactionModalComponent
  ],
  template: `
    <div class="account-detail-page">
      <!-- Navbar -->
      <app-navbar></app-navbar>

      <div class="page-container">
        <!-- Loading State -->
        <div class="loading-container" *ngIf="isLoading()">
          <div class="spinner"></div>
          <p>Cargando cuenta...</p>
        </div>

        <!-- Error State -->
        <div class="error-container" *ngIf="hasError()">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="error-message">{{ errorMessage() }}</p>
        </div>

        <!-- Content -->
        <div *ngIf="!isLoading() && !hasError() && account()">
          <!-- Header -->
          <app-account-header
            [accountName]="account()!.name"
            [accountType]="account()!.type"
            [iban]="account()!.account_number | maskIban"
            [bankName]="account()!.bank_name"
            [currency]="account()!.currency"
            [transactionCount]="account()!.transaction_count || 0"
            [notes]="account()!.notes || ''"
            [createdAt]="account()!.created_at"
            [isActive]="account()!.is_active"
          ></app-account-header>

          <!-- Grid: Balance card (izquierda) + Summary cards (derecha) -->
          <div class="cards-grid">
            <app-account-balance-card
              [currentBalance]="account()!.balance"
              [variation]="monthlyStats().balanceVariation"
              [trendData]="balanceTrend()"
            ></app-account-balance-card>

            <div class="summary-cards-container">
              <app-account-summary-cards
                [monthlyIncome]="monthlyStats().monthlyIncome"
                [monthlyExpenses]="monthlyStats().monthlyExpenses"
                [incomeVariation]="monthlyStats().incomeVariation"
                [expenseVariation]="monthlyStats().expenseVariation"
              ></app-account-summary-cards>
            </div>
          </div>

          <!-- Tabla de movimientos -->
          <app-account-transactions-table
            [transactions]="paginatedTransactions()"
            [totalItems]="totalTransactions()"
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            [pageSize]="pageSize()"
            (onPageChange)="handlePageChange($event)"
            (onFilterChange)="handleFilterChange()"
            (onTransfer)="handleTransfer()"
            (onAddTransaction)="handleAddTransaction()"
          ></app-account-transactions-table>
        </div>

        <!-- Transaction Modal -->
        <app-transaction-modal
          *ngIf="showTransactionModal()"
          [config]="transactionModalConfig()!"
          (closeModal)="closeTransactionModal()"
          (transactionCreated)="onTransactionCreated($event)"
        ></app-transaction-modal>
      </div>
    </div>
  `,
  styles: [`
    .account-detail-page {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .page-container {
      max-width: 1400px;
      padding: var(--space-6);
      margin: 0 auto;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
      margin-bottom: var(--space-5);
    }

    .summary-cards-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: var(--space-5);
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) var(--space-5);
      text-align: center;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid var(--color-slate-600);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon {
      width: 64px;
      height: 64px;
      color: var(--color-negative);
      margin-bottom: var(--space-4);
    }

    .error-message {
      color: var(--color-negative);
      font-weight: 500;
    }

    @media (max-width: 1024px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: var(--space-4);
      }
    }
  `]
})
export class AccountDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private accountDetailService = inject(AccountDetailService);

  accountId: string = '';

  // Modal state
  showTransactionModal = signal(false);
  transactionModalConfig = signal<TransactionModalConfig | null>(null);

  // Data
  account = computed(() => {
    const accounts = this.accountService.accounts();
    return accounts.find(acc => acc.id === this.accountId);
  });

  // Loading & Error states
  isLoading = computed(() =>
    this.accountService.loading() ||
    this.transactionService.loading() ||
    this.categoryService.loading()
  );

  hasError = computed(() =>
    this.accountService.error() !== null ||
    this.transactionService.error() !== null ||
    this.categoryService.error() !== null
  );

  errorMessage = computed(() => {
    return this.accountService.error() ||
           this.transactionService.error() ||
           this.categoryService.error() ||
           'Error desconocido';
  });

  // Computed data from service
  monthlyStats = computed(() => this.accountDetailService.monthlyStats(this.accountId)());
  balanceTrend = computed(() => this.accountDetailService.balanceTrend(this.accountId)());
  paginatedTransactions = computed(() => this.accountDetailService.paginatedTransactions(this.accountId)());
  totalTransactions = computed(() => this.accountDetailService.filteredTransactions(this.accountId)().length);
  totalPages = computed(() => this.accountDetailService.totalPages(this.accountId)());
  currentPage = computed(() => this.accountDetailService.filters().page);
  pageSize = computed(() => this.accountDetailService.filters().pageSize);

  ngOnInit(): void {
    // Obtener ID de la cuenta desde la URL
    this.route.params.subscribe(params => {
      this.accountId = params['id'];
      this.loadData();
    });
  }

  loadData(): void {
    // Cargar cuentas si no están cargadas
    if (this.accountService.accounts().length === 0) {
      this.accountService.getAccounts().subscribe();
    }

    // Cargar transacciones de la cuenta
    this.transactionService.getTransactions({
      account_id: this.accountId
    }).subscribe({
      next: () => {},
      error: () => console.error('Error cargando transacciones')
    });

    // Cargar categorías para los filtros (solo categorías con transacciones)
    if (this.categoryService.categories().length === 0) {
      this.categoryService.getCategories().subscribe({
        next: () => {},
        error: () => console.error('Error cargando categorías')
      });
    }
  }

  handlePageChange(page: number): void {
    this.accountDetailService.updateFilters({ page });
  }

  handleFilterChange(): void {
    // Filters updated
  }

  handleTransfer(): void {
    this.transactionModalConfig.set({
      mode: 'transfer',
      preselectedAccountId: this.accountId,
      accountName: this.account()?.name
    });
    this.showTransactionModal.set(true);
  }

  handleAddTransaction(): void {
    this.transactionModalConfig.set({
      mode: 'transaction',
      preselectedAccountId: this.accountId,
      accountName: this.account()?.name
    });
    this.showTransactionModal.set(true);
  }

  closeTransactionModal(): void {
    this.showTransactionModal.set(false);
  }

  onTransactionCreated(transaction: any): void {
    // Reload data to show new transaction
    this.loadData();
  }
}
