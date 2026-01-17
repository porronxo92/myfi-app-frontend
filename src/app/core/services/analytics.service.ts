/**
 * Analytics Service
 * =================
 * 
 * Servicio para interactuar con los endpoints de analytics del backend.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  
  private baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el resumen financiero del período
   */
  getMonthlySummary(period: string = 'current_month', accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('period', period);
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/summary`, { params });
  }

  /**
   * Obtiene el desglose por categorías
   */
  getCategoryBreakdown(
    type: 'expense' | 'income',
    period: string = 'current_month',
    accountId?: string | null
  ): Observable<any> {
    let params = new HttpParams()
      .set('transaction_type', type)
      .set('period', period);
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/categories`, { params });
  }

  /**
   * Obtiene datos formateados para pie chart
   */
  getCategoryChartData(
    type: 'expense' | 'income',
    period: string = 'current_month',
    accountId?: string | null
  ): Observable<any> {
    let params = new HttpParams()
      .set('transaction_type', type)
      .set('period', period);
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/categories/chart`, { params });
  }

  /**
   * Obtiene tendencias de N meses
   */
  getTrends(months: number = 6, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('months', months.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/trends`, { params });
  }

  /**
   * Obtiene datos de tendencias para line chart
   */
  getTrendsChartData(months: number = 6, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('months', months.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/trends/chart`, { params });
  }

  /**
   * Detecta anomalías en transacciones
   */
  getAnomalies(threshold: number = 2.0, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('threshold', threshold.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/anomalies`, { params });
  }

  /**
   * Obtiene gastos recurrentes
   */
  getRecurringExpenses(accountId?: string | null): Observable<any> {
    let params = new HttpParams();
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/recurring`, { params });
  }

  /**
   * Obtiene potencial de ahorro
   */
  getSavingsPotential(accountId?: string | null): Observable<any> {
    let params = new HttpParams();
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/savings-potential`, { params });
  }

  /**
   * Compara dos períodos
   */
  comparePeriods(period1: string, period2: string, accountId?: string | null): Observable<any> {
    let params = new HttpParams()
      .set('period1', period1)
      .set('period2', period2);
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/compare`, { params });
  }

  /**
   * Obtiene top merchants/comercios
   */
  getTopMerchants(period: string = 'current_month', limit: number = 10, accountId?: string | null): Observable<any> {
    let params = new HttpParams()
      .set('period', period)
      .set('limit', limit.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/top-merchants`, { params });
  }

  /**
   * Calcula tasa de ahorro
   */
  getSavingsRate(period: string = 'current_month', accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('period', period);
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/savings-rate`, { params });
  }

  // ============================================
  // NUEVOS MÉTODOS PARA DATOS ANUALES
  // ============================================

  /**
   * Obtiene los años disponibles con transacciones
   */
  getAvailableYears(): Observable<any> {
    return this.http.get(`${this.baseUrl}/available-years`);
  }

  /**
   * Obtiene el balance anual (inicial y actual)
   */
  getAnnualBalance(year: number, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('year', year.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/annual-balance`, { params });
  }

  /**
   * Obtiene la tasa de ahorro anual
   */
  getAnnualSavingsRate(year: number, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('year', year.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/annual-savings-rate`, { params });
  }

  /**
   * Obtiene los ingresos anuales
   */
  getAnnualIncome(year: number, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('year', year.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/annual-income`, { params });
  }

  /**
   * Obtiene los gastos anuales
   */
  getAnnualExpenses(year: number, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('year', year.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/annual-expenses`, { params });
  }

  /**
   * Obtiene desglose de ingresos y gastos por categoría para un mes específico
   * Ideal para Doughnut Charts
   */
  getCategoryBreakdownByMonth(
    year: number,
    month: number,
    accountId?: string | null
  ): Observable<any> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/category-breakdown`, { params });
  }

  /**
   * Obtiene tendencia mensual de ingresos y gastos para un año completo
   * Ideal para Line Charts
   */
  getMonthlyTrendByYear(year: number, accountId?: string | null): Observable<any> {
    let params = new HttpParams().set('year', year.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/monthly-trend`, { params });
  }
}
