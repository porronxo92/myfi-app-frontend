import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';
import {
  Budget,
  BudgetListItem,
  BudgetCreate,
  BudgetUpdate,
  BudgetCopyRequest,
  BudgetProgress,
  BudgetSummary,
  OverspentCategory,
  SuggestedBudget,
  BudgetComparison
} from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private apiUrl = `${environment.apiUrl}/budgets`;

  // State signals
  budgets = signal<BudgetListItem[]>([]);
  currentBudget = signal<Budget | null>(null);
  currentProgress = signal<BudgetProgress | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // ============================================
  // GET - Obtener presupuestos
  // ============================================

  /**
   * Obtener todos los presupuestos del usuario
   * @param year Filtrar por año (opcional)
   */
  getBudgets(year?: number): Observable<BudgetListItem[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<BudgetListItem[]>(this.apiUrl, { params }).pipe(
      tap({
        next: (budgets) => {
          this.budgets.set(budgets);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar presupuestos');
          this.loading.set(false);
          this.logger.error('Error fetching budgets');
        }
      })
    );
  }

  /**
   * Obtener el presupuesto del mes actual
   */
  getCurrentBudget(): Observable<Budget | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Budget | null>(`${this.apiUrl}/current`).pipe(
      tap({
        next: (budget) => {
          this.currentBudget.set(budget);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar presupuesto actual');
          this.loading.set(false);
          this.logger.error('Error fetching current budget');
        }
      })
    );
  }

  /**
   * Obtener un presupuesto específico por ID
   * @param id ID del presupuesto
   */
  getBudgetById(id: string): Observable<Budget> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Budget>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => this.loading.set(false),
        error: () => {
          this.error.set('Error al cargar presupuesto');
          this.loading.set(false);
          this.logger.error('Error fetching budget');
        }
      })
    );
  }

  /**
   * Obtener resumen ejecutivo del presupuesto
   * @param id ID del presupuesto
   */
  getBudgetSummary(id: string): Observable<BudgetSummary> {
    return this.http.get<BudgetSummary>(`${this.apiUrl}/${id}/summary`);
  }

  /**
   * Obtener progreso detallado del presupuesto
   * @param id ID del presupuesto
   */
  getBudgetProgress(id: string): Observable<BudgetProgress> {
    return this.http.get<BudgetProgress>(`${this.apiUrl}/${id}/progress`).pipe(
      tap({
        next: (progress) => {
          this.currentProgress.set(progress);
        },
        error: () => {
          this.logger.error('Error fetching budget progress');
        }
      })
    );
  }

  // ============================================
  // POST - Crear presupuesto
  // ============================================

  /**
   * Crear un nuevo presupuesto
   * @param budgetData Datos del presupuesto a crear
   */
  createBudget(budgetData: BudgetCreate): Observable<Budget> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Budget>(this.apiUrl, budgetData).pipe(
      tap({
        next: (budget) => {
          // Actualizar lista de presupuestos
          this.getBudgets().subscribe();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al crear presupuesto');
          this.loading.set(false);
          this.logger.error('Error creating budget');
        }
      })
    );
  }

  /**
   * Copiar un presupuesto a otro mes
   * @param budgetId ID del presupuesto a copiar
   * @param copyData Datos de destino (mes y año)
   */
  copyBudget(budgetId: string, copyData: BudgetCopyRequest): Observable<Budget> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Budget>(`${this.apiUrl}/copy/${budgetId}`, copyData).pipe(
      tap({
        next: (budget) => {
          // Actualizar lista de presupuestos
          this.getBudgets().subscribe();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al copiar presupuesto');
          this.loading.set(false);
          this.logger.error('Error copying budget');
        }
      })
    );
  }

  // ============================================
  // PUT - Actualizar presupuesto
  // ============================================

  /**
   * Actualizar un presupuesto existente
   * @param id ID del presupuesto
   * @param budgetData Datos a actualizar
   */
  updateBudget(id: string, budgetData: BudgetUpdate): Observable<Budget> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<Budget>(`${this.apiUrl}/${id}`, budgetData).pipe(
      tap({
        next: (budget) => {
          // Actualizar lista de presupuestos
          this.getBudgets().subscribe();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al actualizar presupuesto');
          this.loading.set(false);
          this.logger.error('Error updating budget');
        }
      })
    );
  }

  // ============================================
  // DELETE - Eliminar presupuesto
  // ============================================

  /**
   * Eliminar un presupuesto
   * @param id ID del presupuesto
   */
  deleteBudget(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          // Actualizar lista de presupuestos
          this.getBudgets().subscribe();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al eliminar presupuesto');
          this.loading.set(false);
          this.logger.error('Error deleting budget');
        }
      })
    );
  }

  // ============================================
  // PUT - Actualizar item de presupuesto
  // ============================================

  /**
   * Actualizar un item específico del presupuesto
   * @param itemId ID del item del presupuesto
   * @param itemData Datos a actualizar (category_id, allocated_amount, notes)
   */
  updateBudgetItem(itemId: string, itemData: { category_id: string; allocated_amount: number; notes?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/items/${itemId}`, itemData);
  }

  // ============================================
  // ANÁLISIS Y REPORTES
  // ============================================

  /**
   * Obtener categorías que han excedido su presupuesto
   * @param id ID del presupuesto
   */
  getOverspentCategories(id: string): Observable<OverspentCategory[]> {
    return this.http.get<OverspentCategory[]>(`${this.apiUrl}/${id}/overspent`);
  }

  /**
   * Obtener sugerencia de presupuesto basada en histórico
   * @param month Mes objetivo
   * @param year Año objetivo
   * @param monthsBack Número de meses a analizar (default: 3)
   */
  suggestBudget(month: number, year: number, monthsBack: number = 3): Observable<SuggestedBudget> {
    let params = new HttpParams().set('months_back', monthsBack.toString());
    
    return this.http.get<SuggestedBudget>(`${this.apiUrl}/suggest/${month}/${year}`, { params });
  }

  /**
   * Comparar dos presupuestos
   * @param budgetId1 ID del primer presupuesto
   * @param budgetId2 ID del segundo presupuesto
   */
  compareBudgets(budgetId1: string, budgetId2: string): Observable<BudgetComparison> {
    return this.http.get<BudgetComparison>(`${this.apiUrl}/compare/${budgetId1}/${budgetId2}`);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Limpiar estado de errores
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Verificar si existe presupuesto para un mes/año específico
   * @param month Mes (1-12)
   * @param year Año
   */
  async budgetExistsForPeriod(month: number, year: number): Promise<boolean> {
    try {
      const budgets = await this.getBudgets(year).toPromise();
      return budgets?.some(b => b.month === month && b.year === year) ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Obtener el color según el estado del presupuesto
   * @param status Estado del presupuesto
   */
  getStatusColor(status: 'ok' | 'warning' | 'over'): string {
    const colors = {
      ok: '#10B981',      // Verde
      warning: '#F59E0B', // Amarillo
      over: '#EF4444'     // Rojo
    };
    return colors[status];
  }

  /**
   * Obtener el label según el estado del presupuesto
   * @param status Estado del presupuesto
   */
  getStatusLabel(status: 'ok' | 'warning' | 'over'): string {
    const labels = {
      ok: 'En Orden',
      warning: 'Atención',
      over: 'Excedido'
    };
    return labels[status];
  }
}
