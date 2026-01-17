/**
 * Insights Service
 * ================
 * 
 * Servicio para interactuar con los endpoints de insights del backend.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InsightsService {
  
  private baseUrl = `${environment.apiUrl}/insights`;

  constructor(private http: HttpClient) {}

  /**
   * Genera insights financieros con IA
   */
  generateInsights(numInsights: number = 5, accountId?: string | null): Observable<any[]> {
    let params = new HttpParams().set('num_insights', numInsights.toString());
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get<any[]>(`${this.baseUrl}/generate`, { params });
  }

  /**
   * Obtiene análisis de salud financiera
   */
  getFinancialHealth(accountId?: string | null): Observable<any> {
    let params = new HttpParams();
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/financial-health`, { params });
  }

  /**
   * Obtiene recomendaciones personalizadas
   */
  getRecommendations(accountId?: string | null): Observable<any> {
    let params = new HttpParams();
    if (accountId !== null && accountId !== undefined) {
      params = params.set('account_id', accountId);
    }
    return this.http.get(`${this.baseUrl}/recommendations`, { params });
  }

  /**
   * Obtiene predicción de cierre de mes
   */
  getMonthlyOutlook(): Observable<any> {
    return this.http.get(`${this.baseUrl}/monthly-outlook`);
  }

  /**
   * Crea un plan de ahorro personalizado
   */
  createSavingsPlan(targetAmount: number, months: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/savings-plan`, null, {
      params: {
        target_amount: targetAmount.toString(),
        months: months.toString()
      }
    });
  }

  /**
   * Análisis personalizado (chat con IA)
   */
  customAnalysis(question: string, context?: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/custom-analysis`, {
      question,
      context
    });
  }

  /**
   * Obtiene datos combinados para dashboard (optimizado)
   */
  getDashboardData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }

  /**
   * Chat conversacional con el agente
   */
  chat(message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/chat`, { message });
  }
}
