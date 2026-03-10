import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  StockSearchResult,
  EnrichedPosition,
  AddPositionRequest,
  UpdatePositionRequest,
  PortfolioSummary,
  InvestmentInsight,
  StockLogoResponse
} from '../models/investment.model';

/**
 * Investment Service
 * Gestiona las operaciones de inversiones bursátiles consumiendo el backend
 * TODO el procesamiento, cálculos y llamadas a APIs externas se hacen en el backend
 */
@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/investments`;

  /**
   * Buscar acciones por símbolo o nombre de empresa
   * El backend consulta Alpha Vantage API
   */
  searchStocks(query: string): Observable<StockSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const params = new HttpParams().set('q', query.trim());

    return this.http.get<StockSearchResult[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(() => {
        console.error('Error searching stocks');
        return of([]);
      })
    );
  }

  /**
   * Obtener cotización en tiempo real de un ticker específico
   * Consulta directamente Alpha Vantage GLOBAL_QUOTE
   */
  getStockQuote(ticker: string): Observable<any> {
    if (!ticker || ticker.trim().length === 0) {
      return of(null);
    }

    const params = new HttpParams().set('q', ticker.trim().toUpperCase());

    return this.http.get<any>(`${this.apiUrl}/quote`, { params }).pipe(
      catchError(() => {
        console.error('Error fetching quote');
        return of(null);
      })
    );
  }

  /**
   * Obtener logo de una acción desde Brandfetch API
   */
  getStockLogo(ticker: string): Observable<StockLogoResponse> {
    if (!ticker || ticker.trim().length === 0) {
      return of({
        ticker: ticker,
        logo_url: null,
        available: false,
        message: 'Invalid ticker'
      });
    }

    const params = new HttpParams().set('q', ticker.trim().toUpperCase());

    return this.http.get<StockLogoResponse>(`${this.apiUrl}/logo`, { params }).pipe(
      catchError(() => {
        console.error('Error fetching logo');
        return of({
          ticker: ticker.toUpperCase(),
          logo_url: null,
          available: false,
          message: 'Error fetching logo'
        });
      })
    );
  }

  /**
   * Obtener todas las posiciones enriquecidas con resumen e insights
   * El backend ya retorna todo calculado
   * @param status Filtrar por status: 'active', 'sold', o undefined para todas
   */
  getInvestmentsWithSummary(status?: 'active' | 'sold'): Observable<{
    positions: EnrichedPosition[];
    summary: PortfolioSummary;
    insights: InvestmentInsight[];
  }> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{
      positions: EnrichedPosition[];
      summary: PortfolioSummary;
      insights: InvestmentInsight[];
    }>(this.apiUrl, { params }).pipe(
      catchError(() => {
        console.error('Error fetching investments');
        // Retornar estructura vacía en caso de error
        return of({
          positions: [],
          summary: {
            totalValue: 0,
            totalInvested: 0,
            totalGainLoss: 0,
            totalGainLossPercent: 0,
            dayChange: 0,
            dayChangePercent: 0,
            positionsCount: 0
          },
          insights: []
        });
      })
    );
  }

  /**
   * Obtener una inversión específica enriquecida
   */
  getInvestment(id: string): Observable<EnrichedPosition | null> {
    return this.http.get<EnrichedPosition>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        console.error('Error fetching investment');
        return of(null);
      })
    );
  }

  /**
   * Agregar nueva posición
   */
  addPosition(request: AddPositionRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  /**
   * Actualizar posición existente
   */
  updatePosition(id: string, request: UpdatePositionRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Vender posición (cerrar swing trade)
   * Marca como 'sold' y registra precio/fecha de venta
   */
  sellPosition(id: string, salePrice: number, saleDate: string, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/sell`, {
      salePrice,
      saleDate,
      notes
    });
  }

  /**
   * Eliminar posición permanentemente
   * ATENCIÓN: Esta acción es irreversible
   */
  deletePosition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

