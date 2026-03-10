/**
 * Dashboard State Service
 * =======================
 * 
 * Gestiona el estado global del dashboard, filtros y datos.
 * Coordina la carga de datos de múltiples endpoints en paralelo.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { InsightsService } from './insights.service';

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
  // Datos ANUALES para Summary Cards (no afectados por filtro de mes)
  annualSummary: AnnualSummary;
  
  // Datos MENSUALES para gráficos y detalles (afectados por filtros de año + mes)
  summary: FinancialSummary;
  trends: {
    balance: TrendComparison;
    income: TrendComparison;
    expenses: TrendComparison;
  };
  insights: any[];
  categoryBreakdown: any;          // DEPRECATED - usar monthlyCategoryBreakdown
  monthlyTrend: any;                // DEPRECATED - usar yearlyMonthlyTrend
  topSpending: any[];
  anomalies: any[];
  recurringExpenses: any[];
  savingsPotential: any;
  financialHealth: any;
  recommendations: any[];
  savingsRate: any;
  
  // NUEVOS - Datos para Charts Grid
  monthlyCategoryBreakdown: any;   // Desglose income + expenses del mes
  yearlyMonthlyTrend: any[];       // Tendencia de 12 meses del año
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  
  // BehaviorSubjects privados
  private _filters$ = new BehaviorSubject<DashboardFilters>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    accountId: null
  });
  
  private _data$ = new BehaviorSubject<DashboardData | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  // Observables públicos (read-only)
  public readonly filters$ = this._filters$.asObservable();
  public readonly data$ = this._data$.asObservable();
  public readonly loading$ = this._loading$.asObservable();
  public readonly error$ = this._error$.asObservable();

  constructor(
    private analyticsService: AnalyticsService,
    private insightsService: InsightsService
  ) {
    // Cargar datos iniciales
    this.loadDashboardData();
  }

  // Getters
  getFilters(): Observable<DashboardFilters> {
    return this.filters$;
  }

  getData(): Observable<DashboardData | null> {
    return this.data$;
  }

  isLoading(): Observable<boolean> {
    return this.loading$;
  }

  getError(): Observable<string | null> {
    return this.error$;
  }

  // Setters
  updateFilters(filters: Partial<DashboardFilters>): void {
    const currentFilters = this._filters$.value;
    const newFilters = { ...currentFilters, ...filters };
    
    this._filters$.next(newFilters);
    
    // Guardar en sessionStorage para persistencia
    sessionStorage.setItem('dashboard_filters', JSON.stringify(newFilters));
    
    // Recargar datos con nuevos filtros
    this.loadDashboardData();
  }

  setPeriod(period: string): void {
    // Convertir period a year/month si es necesario
    // Por ahora mantener compatibilidad
    this.loadDashboardData();
  }

  setYear(year: number): void {
    this.updateFilters({ year });
  }

  setMonth(month: number): void {
    this.updateFilters({ month });
  }

  setAccount(accountId: string | null): void {
    this.updateFilters({ accountId });
  }

  setCategory(categoryId: number | null): void {
    // Mantener por compatibilidad pero no hace nada
  }

  // Actions
  async loadDashboardData(): Promise<void> {
    this._loading$.next(true);
    this._error$.next(null);
    
    try {
      const filters = this._filters$.value;
      const { year, month, accountId } = filters;
      
      // Convertir year/month a period string para endpoints mensuales
      const period = this.buildPeriodString(year, month);
      const previousPeriod = this.getPreviousPeriod(period);
      
      // Peticiones en paralelo (19 llamadas: 4 anuales + 15 mensuales)
      const [
        // === DATOS ANUALES (para Summary Cards - solo afectados por año y cuenta) ===
        annualBalance,
        annualIncome,
        annualExpenses,
        annualSavingsRate,
        
        // === DATOS MENSUALES (para gráficos y detalles) ===
        summary,
        currentData,
        previousData,
        insights,
        categories,
        trends,
        topSpending,
        anomalies,
        recurringExpenses,
        savingsPotential,
        financialHealth,
        recommendations,
        savingsRate,
        
        // === NUEVOS - Datos para Charts Grid ===
        monthlyCategoryBreakdown,  // Desglose income + expenses del mes
        yearlyMonthlyTrend          // Tendencia de 12 meses del año
      ] = await Promise.all([
        // Datos anuales - INDEPENDIENTES del mes
        firstValueFrom(this.analyticsService.getAnnualBalance(year, accountId)),
        firstValueFrom(this.analyticsService.getAnnualIncome(year, accountId)),
        firstValueFrom(this.analyticsService.getAnnualExpenses(year, accountId)),
        firstValueFrom(this.analyticsService.getAnnualSavingsRate(year, accountId)),
        
        // Datos mensuales - DEPENDIENTES de año + mes
        // 1. Resumen del período actual
        firstValueFrom(this.analyticsService.getMonthlySummary(period, accountId)),
        
        // 2. Datos actuales completos
        firstValueFrom(this.analyticsService.getMonthlySummary(period, accountId)),
        
        // 3. Datos del período anterior para comparación
        firstValueFrom(this.analyticsService.getMonthlySummary(previousPeriod, accountId)),
        
        // 4. Insights generados por IA
        firstValueFrom(this.insightsService.generateInsights(5, accountId)),
        
        // 5. Desglose por categorías (legacy)
        firstValueFrom(this.analyticsService.getCategoryBreakdown('expense', period, accountId)),
        
        // 6. Tendencias mensuales (legacy)
        firstValueFrom(this.analyticsService.getTrends(6, accountId)),
        
        // 7. Top gastos
        firstValueFrom(this.analyticsService.getTopMerchants(period, 10, accountId)),
        
        // 8. Anomalías detectadas
        firstValueFrom(this.analyticsService.getAnomalies(2.0, accountId)),
        
        // 9. Gastos recurrentes
        firstValueFrom(this.analyticsService.getRecurringExpenses(accountId)),
        
        // 10. Potencial de ahorro
        firstValueFrom(this.analyticsService.getSavingsPotential(accountId)),
        
        // 11. Salud financiera (score)
        firstValueFrom(this.insightsService.getFinancialHealth(accountId)),
        
        // 12. Recomendaciones personalizadas
        firstValueFrom(this.insightsService.getRecommendations(accountId)),
        
        // 13. Tasa de ahorro
        firstValueFrom(this.analyticsService.getSavingsRate(period, accountId)),
        
        // === NUEVOS - Charts Grid ===
        // 14. Desglose income + expenses del mes seleccionado
        firstValueFrom(this.analyticsService.getCategoryBreakdownByMonth(year, month, accountId)),
        
        // 15. Tendencia mensual del año completo
        firstValueFrom(this.analyticsService.getMonthlyTrendByYear(year, accountId))
      ]);

      // Calcular tendencias comparativas
      const trendData = this.calculateTrends(currentData, previousData);

      const dashboardData: DashboardData = {
        // Datos anuales para Summary Cards
        annualSummary: {
          balance: annualBalance,
          income: annualIncome,
          expenses: annualExpenses,
          savingsRate: annualSavingsRate
        },
        
        // Datos mensuales para gráficos
        summary: summary as FinancialSummary,
        trends: trendData,
        insights: insights as any[],
        categoryBreakdown: categories,          // DEPRECATED
        monthlyTrend: trends,                    // DEPRECATED
        topSpending: topSpending as any[],
        anomalies: anomalies as any[],
        recurringExpenses: recurringExpenses as any[],
        savingsPotential,
        financialHealth,
        recommendations: recommendations as any[],
        savingsRate,
        
        // NUEVOS - Charts Grid
        monthlyCategoryBreakdown,
        yearlyMonthlyTrend
      };

      this._data$.next(dashboardData);
      
    } catch (error: any) {
      console.error('Error loading dashboard data');
      this._error$.next(error.message || 'Error al cargar datos del dashboard');
    } finally {
      this._loading$.next(false);
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  clearError(): void {
    this._error$.next(null);
  }

  // Helper methods
  
  /**
   * Convierte year/month a string de período para el backend
   * Formato: YYYY-MM (ejemplo: 2025-12, 2026-01)
   */
  private buildPeriodString(year: number, month: number): string {
    const monthStr = month.toString().padStart(2, '0');
    return `${year}-${monthStr}`;
  }
  
  private getPreviousPeriod(period: string): string {
    // Si es formato YYYY-MM, calcular mes anterior
    if (period.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = period.split('-').map(Number);
      let prevYear = year;
      let prevMonth = month - 1;
      
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
      }
      
      return `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
    }
    
    // Mapeo legacy para períodos no basados en year/month
    const periodMap: { [key: string]: string } = {
      'current_month': 'last_month',
      'last_month': 'last_month', // ir 2 meses atrás
      'current_year': 'last_year',
      'last_3_months': 'last_3_months',
      'last_6_months': 'last_6_months',
      'last_12_months': 'last_12_months'
    };
    
    return periodMap[period] || 'last_month';
  }

  private calculateTrends(current: any, previous: any): any {
    const calculateChange = (currentVal: number, previousVal: number) => {
      const change = currentVal - previousVal;
      const change_pct = previousVal !== 0 ? (change / Math.abs(previousVal)) * 100 : 0;
      
      let direction: 'up' | 'down' | 'neutral' = 'neutral';
      if (change > 0) direction = 'up';
      else if (change < 0) direction = 'down';
      
      return {
        current: currentVal,
        previous: previousVal,
        change,
        change_pct,
        direction
      };
    };

    return {
      balance: calculateChange(current.net_balance, previous.net_balance),
      income: calculateChange(current.total_income, previous.total_income),
      expenses: calculateChange(current.total_expenses, previous.total_expenses)
    };
  }

  // Restaurar filtros desde sessionStorage
  restoreFilters(): void {
    const savedFilters = sessionStorage.getItem('dashboard_filters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        this._filters$.next(filters);
      } catch (e) {
        console.error('Error restoring filters');
      }
    }
  }
}
