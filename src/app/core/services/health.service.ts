/**
 * Health Service
 * ==============
 * 
 * Servicio para generar informes de salud financiera usando IA.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HealthReport {
  health_score: number;
  score_category: 'excelente' | 'buena' | 'mejorable' | 'crítica';
  summary: {
    main_insight: string;
    period_analyzed: string;
  };
  strengths: string[];
  weaknesses: string[];
  alerts: Alert[];
  recommendations: Recommendation[];
  predictions: Predictions;
}

export interface Alert {
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: string;
}

export interface Recommendation {
  category: 'ahorro' | 'gasto' | 'inversión' | 'presupuesto';
  title: string;
  description: string;
  potential_saving: number;
}

export interface Predictions {
  end_of_year_balance: number;
  projected_savings: number;
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/health`;

  /**
   * Genera un informe de salud financiera usando IA
   */
  generateHealthReport(year: number, accountId?: string | null): Observable<HealthReport> {
    let params = new HttpParams().set('year', year.toString());
    
    if (accountId) {
      params = params.set('account_id', accountId);
    }

    return this.http.get<HealthReport>(`${this.baseUrl}/financial-report`, { params });
  }
}
