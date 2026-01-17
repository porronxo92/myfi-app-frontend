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
    console.log('📊 Dashboard cargado para usuario:', this.user()?.email);
    this.loadData();
    this.loadDashboardAnalytics();
    this.loadAvailableYears();

    // Subscribe to filter changes
    this.dashboardFilters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        console.log('Filtros de dashboard actualizados:', filters);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    console.log('🔄 Cargando datos del dashboard...');
    
    // Solo cargar cuentas al inicio
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        console.log(`📋 Cuentas cargadas: ${accounts.length}`);
        
        // Solo cargar transacciones si hay cuentas (NO cargar categorías automáticamente)
        if (accounts.length > 0) {
          console.log('✅ Hay cuentas, cargando transacciones...');
          this.loadTransactions();
        } else {
          console.log('ℹ️ No hay cuentas, mostrando estado vacío');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando cuentas:', err);
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
      next: () => console.log('✅ Transacciones cargadas'),
      error: (err) => console.error('❌ Error cargando transacciones:', err)
    });
  }

  logout(): void {
    console.log('🚪 Abriendo modal de logout');
    this.showLogoutModal.set(true);
    console.log('📊 Estado showLogoutModal:', this.showLogoutModal());
  }

  confirmLogout(): void {
    console.log('✅ Confirmando logout');
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
    console.log('✅ Creando cuenta con datos:', accountData);
    
    // Llamar al servicio para crear la cuenta
    this.accountService.createAccount(accountData).subscribe({
      next: () => {
        console.log('✅ Cuenta creada exitosamente');
        this.closeAccountModal();
        // Recargar datos
        this.loadData();
      },
      error: (error) => {
        console.error('❌ Error al crear la cuenta:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
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
    console.log('📊 Cargando analytics del dashboard...');
    this.dashboardState.loadDashboardData();
  }

  /**
   * Handle filter changes
   */
  onFiltersChange(filters: any): void {
    console.log('🔍 Actualizando filtros:', filters);
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
    console.log('📅 Año cambiado a:', year);
    this.dashboardState.setYear(year);
  }

  /**
   * Handle month filter change
   */
  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const month = Number(select.value);
    console.log('📆 Mes cambiado a:', month);
    this.dashboardState.setMonth(month);
  }

  /**
   * Handle period filter change (mantener por compatibilidad)
   */
  onPeriodChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const period = select.value;
    console.log('📅 Período cambiado a:', period);
    this.dashboardState.setPeriod(period);
  }

  /**
   * Handle account filter change
   */
  onAccountChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const accountId = select.value || null;
    console.log('🏦 Cuenta cambiada a:', accountId);
    this.dashboardState.setAccount(accountId);
  }

  /**
   * Refresh dashboard data manually
   */
  refreshDashboard(): void {
    console.log('🔄 Refrescando dashboard manualmente...');
    this.dashboardState.loadDashboardData();
  }

  /**
   * Refresh dashboard data
   */
  onRefresh(): void {
    console.log('🔄 Refrescando dashboard...');
    this.loadData();
    this.loadDashboardAnalytics();
  }

  /**
   * Toggle chatbot sidebar
   */
  toggleChatbot(): void {
    this.isChatbotOpen.set(!this.isChatbotOpen());
    console.log('💬 Chatbot abierto:', this.isChatbotOpen());
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
    console.log('♻️ Reintentando carga...');
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
