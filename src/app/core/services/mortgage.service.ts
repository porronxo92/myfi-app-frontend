import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FinancialProfile,
  MortgageCapacityResult,
  MortgageConfig,
  TargetPriceResult
} from '../models/mortgage.model';

/**
 * Mortgage Service
 * Gestiona las operaciones de capacidad hipotecaria consumiendo el backend
 */
@Injectable({
  providedIn: 'root'
})
export class MortgageService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/financial-analysis`;

  /**
   * Obtener perfil financiero del usuario
   * GET /api/financial-analysis/financial-profile
   */
  getFinancialProfile(monthsToAnalyze = 6): Observable<FinancialProfile | null> {
    const params = new HttpParams().set('months_to_analyze', monthsToAnalyze.toString());

    return this.http.get<FinancialProfile>(`${this.baseUrl}/financial-profile`, { params }).pipe(
      catchError(() => {
        console.error('Error fetching financial profile');
        return of(null);
      })
    );
  }

  /**
   * Calcular capacidad hipotecaria con parametros opcionales (GET)
   * GET /api/financial-analysis/mortgage-capacity
   */
  getMortgageCapacity(
    config?: Partial<MortgageConfig>,
    monthsToAnalyze = 6
  ): Observable<MortgageCapacityResult | null> {
    let params = new HttpParams().set('months_to_analyze', monthsToAnalyze.toString());

    if (config?.interest_rate !== undefined) {
      params = params.set('interest_rate', config.interest_rate.toString());
    }
    if (config?.years !== undefined) {
      params = params.set('years', config.years.toString());
    }
    if (config?.down_payment_ratio !== undefined) {
      params = params.set('down_payment_ratio', config.down_payment_ratio.toString());
    }

    return this.http.get<MortgageCapacityResult>(`${this.baseUrl}/mortgage-capacity`, { params }).pipe(
      catchError(() => {
        console.error('Error fetching mortgage capacity');
        return of(null);
      })
    );
  }

  /**
   * Calcular capacidad hipotecaria con configuracion completa (POST)
   * POST /api/financial-analysis/mortgage-capacity
   */
  calculateMortgageCapacity(
    config: MortgageConfig,
    monthsToAnalyze = 6
  ): Observable<MortgageCapacityResult | null> {
    const params = new HttpParams().set('months_to_analyze', monthsToAnalyze.toString());

    return this.http.post<MortgageCapacityResult>(
      `${this.baseUrl}/mortgage-capacity`,
      config,
      { params }
    ).pipe(
      catchError(() => {
        console.error('Error calculating mortgage capacity');
        return of(null);
      })
    );
  }

  /**
   * Analizar viabilidad de un precio objetivo
   * POST /api/financial-analysis/mortgage-capacity/target-price
   */
  analyzeTargetPrice(
    targetPrice: number,
    config?: MortgageConfig,
    monthsToAnalyze = 6
  ): Observable<TargetPriceResult | null> {
    const params = new HttpParams().set('months_to_analyze', monthsToAnalyze.toString());

    const body = {
      target_price: targetPrice,
      config: config
    };

    return this.http.post<TargetPriceResult>(
      `${this.baseUrl}/mortgage-capacity/target-price`,
      body,
      { params }
    ).pipe(
      catchError(() => {
        console.error('Error analyzing target price');
        return of(null);
      })
    );
  }
}
