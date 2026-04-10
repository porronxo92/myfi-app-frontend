/**
 * Dashboard State Service
 * =======================
 *
 * Gestiona el estado global del dashboard, filtros y datos.
 * Coordina la carga de datos de múltiples endpoints en paralelo.
 *
 * Llamadas al cargar (8 en paralelo, solo analytics — sin IA):
 *   - annual-balance, annual-income, annual-expenses, annual-savings-rate
 *   - anomalies, recurring-expenses
 *   - category-breakdown (por mes), monthly-trend (por año)
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { LoggerService } from './logger.service';

export interface DashboardFilters {
  year: number;              // Año seleccionado
  month: number;             // Mes seleccionado (1-12)
  accountId: string | null;  // UUID de cuenta, null = todas las cuentas
}

export interface FinancialSummary {
  user_id: string;
  period: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  savings_rate: number;
  num_transactions: number;
  currency: string;
}

export interface TrendComparison {
  current: number;
  previous: number;
  change: number;
  change_pct: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface AnnualSummary {
  balance: any;        // Del endpoint annual-balance
  income: any;         // Del endpoint annual-income
  expenses: any;       // Del endpoint annual-expenses
  savingsRate: any;    // Del endpoint annual-savings-rate
}

export interface DashboardData {
  // Datos ANUALES para Summary Cards
  annualSummary: AnnualSummary;

  // Datos MENSUALES para gráficos
  monthlyCategoryBreakdown: any;   // Desglose income + expenses del mes
  yearlyMonthlyTrend: any[];       // Tendencia de 12 meses del año

  // Alertas (analytics, sin IA)
  anomalies: any[];
  recurringExpenses: any[];

  // Datos de IA — vacíos por defecto, se cargan bajo demanda
  insights: any[];
  recommendations: any[];
  financialHealth: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {

  private _filters$ = new BehaviorSubject<DashboardFilters>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    accountId: null
  });

  private _data$ = new BehaviorSubject<DashboardData | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  public readonly filters$ = this._filters$.asObservable();
  public readonly data$ = this._data$.asObservable();
  public readonly loading$ = this._loading$.asObservable();
  public readonly error$ = this._error$.asObservable();

  private logger = inject(LoggerService);

  constructor(private analyticsService: AnalyticsService) {}

  // Getters
  getFilters(): Observable<DashboardFilters> { return this.filters$; }
  getData(): Observable<DashboardData | null> { return this.data$; }
  isLoading(): Observable<boolean> { return this.loading$; }
  getError(): Observable<string | null> { return this.error$; }

  // Setters
  updateFilters(filters: Partial<DashboardFilters>): void {
    const newFilters = { ...this._filters$.value, ...filters };
    this._filters$.next(newFilters);
    sessionStorage.setItem('dashboard_filters', JSON.stringify(newFilters));
    this.loadDashboardData();
  }

  setPeriod(_period: string): void { this.loadDashboardData(); }
  setYear(year: number): void { this.updateFilters({ year }); }
  setMonth(month: number): void { this.updateFilters({ month }); }
  setAccount(accountId: string | null): void { this.updateFilters({ accountId }); }
  setCategory(_categoryId: number | null): void { /* mantener por compatibilidad */ }

  // ============================================
  // CARGA DE DATOS (8 analytics en paralelo, sin IA)
  // ============================================

  async loadDashboardData(): Promise<void> {
    this._loading$.next(true);
    this._error$.next(null);

    try {
      const { year, month, accountId } = this._filters$.value;

      const [
        annualBalance,
        annualIncome,
        annualExpenses,
        annualSavingsRate,
        anomalies,
        recurringExpenses,
        monthlyCategoryBreakdown,
        yearlyMonthlyTrend
      ] = await Promise.all([
        firstValueFrom(this.analyticsService.getAnnualBalance(year, accountId)),
        firstValueFrom(this.analyticsService.getAnnualIncome(year, accountId)),
        firstValueFrom(this.analyticsService.getAnnualExpenses(year, accountId)),
        firstValueFrom(this.analyticsService.getAnnualSavingsRate(year, accountId)),
        firstValueFrom(this.analyticsService.getAnomalies(2.0, accountId)),
        firstValueFrom(this.analyticsService.getRecurringExpenses(accountId)),
        firstValueFrom(this.analyticsService.getCategoryBreakdownByMonth(year, month, accountId)),
        firstValueFrom(this.analyticsService.getMonthlyTrendByYear(year, accountId))
      ]);

      this._data$.next({
        annualSummary: {
          balance: annualBalance,
          income: annualIncome,
          expenses: annualExpenses,
          savingsRate: annualSavingsRate
        },
        monthlyCategoryBreakdown,
        yearlyMonthlyTrend,
        anomalies: anomalies as any[],
        recurringExpenses: recurringExpenses as any[],
        // IA: vacíos hasta que se soliciten explícitamente
        insights: [],
        recommendations: [],
        financialHealth: null
      });

    } catch (error: any) {
      this.logger.error('Error loading dashboard data');
      this._error$.next(error.message || 'Error al cargar datos del dashboard');
    } finally {
      this._loading$.next(false);
    }
  }

  refreshData(): void { this.loadDashboardData(); }
  clearError(): void { this._error$.next(null); }

  // Restaurar filtros desde sessionStorage
  restoreFilters(): void {
    const savedFilters = sessionStorage.getItem('dashboard_filters');
    if (savedFilters) {
      try {
        this._filters$.next(JSON.parse(savedFilters));
      } catch (e) {
        this.logger.error('Error restoring filters');
      }
    }
  }
}
