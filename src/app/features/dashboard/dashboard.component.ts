import { Component, OnInit, inject, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { DashboardStateService } from '../../core/services/dashboard-state.service';
import { ChatbotService } from '../../core/services/chatbot.service';
import { AIQuotaService } from '../../core/services/ai-quota.service';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { FinancialChatbotComponent } from './components/financial-chatbot.component';
import { HealthCardComponent } from './components/health-card.component';
import { ChartsSectionComponent } from './components/charts-section.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    FinancialChatbotComponent,
    HealthCardComponent,
    ChartsSectionComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private dashboardState = inject(DashboardStateService);
  private chatbotService = inject(ChatbotService);
  private aiQuotaService = inject(AIQuotaService);

  // Quota warning signals (exposed to template)
  quotaExceeded = this.aiQuotaService.isQuotaExceeded;
  quotaInfo = this.aiQuotaService.quotaInfo;
  isRateLimited = this.aiQuotaService.isRateLimited;
  quotaState = this.aiQuotaService.quotaState;
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  // Auth
  user = this.authService.user;

  // Data from services (solo lo necesario para el dashboard principal)
  accounts = this.accountService.accounts;

  // New dashboard observables
  dashboardData$ = this.dashboardState.data$;
  dashboardLoading$ = this.dashboardState.loading$;
  dashboardError$ = this.dashboardState.error$;
  dashboardFilters$ = this.dashboardState.filters$;

  // Chatbot state
  isChatbotOpen = signal(false);

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

  // Modal states
  showAccountModal = signal(false);
  showLogoutModal = signal(false);

  // Filtros state
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  availableYears = signal<number[]>([this.currentYear]);

  ngOnInit(): void {
    this.loadData();
    this.loadDashboardAnalytics();
    this.loadAvailableYears();

    // Subscribe to filter changes
    this.dashboardFilters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Filters updated
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    // Solo cargar cuentas al inicio
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        // Solo cargar transacciones si hay cuentas (NO cargar categorías automáticamente)
        if (accounts.length > 0) {
          this.loadTransactions();
        }
      },
      error: (err) => {
        console.error('Error cargando cuentas');
      }
    });
  }

  private loadTransactions(): void {
    // Cargar transacciones del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.transactionService.getTransactions({
      date_from: firstDay.toISOString().split('T')[0],
      date_to: lastDay.toISOString().split('T')[0]
    }).subscribe({
      next: () => {},
      error: () => console.error('Error cargando transacciones')
    });
  }

  logout(): void {
    this.showLogoutModal.set(true);
  }

  confirmLogout(): void {
    this.showLogoutModal.set(false);
    this.authService.logout();
  }

  openNewAccountModal(): void {
    this.showAccountModal.set(true);
  }

  closeAccountModal(): void {
    this.showAccountModal.set(false);
  }

  onAccountCreated(accountData: any): void {
    // Llamar al servicio para crear la cuenta
    this.accountService.createAccount(accountData).subscribe({
      next: () => {
        this.closeAccountModal();
        // Recargar datos
        this.loadData();
      },
      error: () => {
        console.error('Error al crear la cuenta');
      }
    });
  }

  // ============================================
  // NEW METHODS FOR DASHBOARD REDESIGN
  // ============================================

  /**
   * Load dashboard analytics data
   */
  loadDashboardAnalytics(): void {
    this.dashboardState.loadDashboardData();
  }

  /**
   * Handle filter changes
   */
  onFiltersChange(filters: any): void {
    this.dashboardState.updateFilters(filters);
  }

  /**
   * Load available years with transactions
   */
  private loadAvailableYears(): void {
    // Asumiendo que tienes un servicio de analytics inyectado
    // Por ahora, generar años desde 2020 hasta el año actual
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year);
    }
    this.availableYears.set(years);
  }

  /**
   * Handle year filter change
   */
  onYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const year = Number(select.value);
    this.dashboardState.setYear(year);
  }

  /**
   * Handle month filter change
   */
  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const month = Number(select.value);
    this.dashboardState.setMonth(month);
  }

  /**
   * Handle period filter change (mantener por compatibilidad)
   */
  onPeriodChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const period = select.value;
    this.dashboardState.setPeriod(period);
  }

  /**
   * Handle account filter change
   */
  onAccountChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const accountId = select.value || null;
    this.dashboardState.setAccount(accountId);
  }

  /**
   * Refresh dashboard data manually
   */
  refreshDashboard(): void {
    this.dashboardState.loadDashboardData();
  }

  /**
   * Refresh dashboard data
   */
  onRefresh(): void {
    this.loadData();
    this.loadDashboardAnalytics();
  }

  /**
   * Toggle chatbot sidebar
   */
  toggleChatbot(): void {
    this.isChatbotOpen.set(!this.isChatbotOpen());
  }

  /**
   * Close chatbot
   */
  closeChatbot(): void {
    this.isChatbotOpen.set(false);
  }

  /**
   * Retry loading on error
   */
  retry(): void {
    this.onRefresh();
  }

  /**
   * Get month name from month number
   */
  getMonthName(monthNumber: number): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[monthNumber - 1] || '';
  }
}
