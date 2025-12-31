import { Injectable, signal, computed } from '@angular/core';
import { TransactionService } from '../../../core/services/transaction.service';

export interface AccountFilters {
  searchTerm: string;
  categoryId: string | null;
  transactionType: 'all' | 'income' | 'expense';
  startDate: string | null;
  endDate: string | null;
  page: number;
  pageSize: number;
}

export interface AccountMonthlyStats {
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeVariation: number;
  expenseVariation: number;
  balanceVariation: number;
}

export interface BalanceTrendPoint {
  date: string;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountDetailService {
  constructor(private transactionService: TransactionService) {}

  // Estado de filtros
  private _filters = signal<AccountFilters>({
    searchTerm: '',
    categoryId: null,
    transactionType: 'all',
    startDate: null,
    endDate: null,
    page: 1,
    pageSize: 5
  });

  filters = this._filters.asReadonly();

  /**
   * Actualiza los filtros
   */
  updateFilters(partial: Partial<AccountFilters>): void {
    this._filters.update(current => ({ ...current, ...partial }));
  }

  /**
   * Resetea los filtros a valores por defecto
   */
  resetFilters(): void {
    this._filters.set({
      searchTerm: '',
      categoryId: null,
      transactionType: 'all',
      startDate: null,
      endDate: null,
      page: 1,
      pageSize: 5
    });
  }

  /**
   * Calcula transacciones filtradas para una cuenta específica
   */
  filteredTransactions = (accountId: string) => computed(() => {
    const allTransactions = this.transactionService.transactions();
    const filters = this._filters();

    let filtered = allTransactions.filter(tx => tx.account_id === accountId);

    // Filtro por búsqueda
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría
    if (filters.categoryId) {
      filtered = filtered.filter(tx => tx.category_id === filters.categoryId);
    }

    // Filtro por tipo de transacción
    if (filters.transactionType !== 'all') {
      filtered = filtered.filter(tx => {
        const txType = tx.transaction_type || tx.type;
        return txType === filters.transactionType;
      });
    }

    // Filtro por rango de fechas
    const getDate = (tx: any) => tx.date || tx.transaction_date;
    if (filters.startDate) {
      filtered = filtered.filter(tx => getDate(tx) >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(tx => getDate(tx) <= filters.endDate!);
    }

    // Ordenar por fecha descendente
    return filtered.sort((a, b) => 
      new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime()
    );
  });

  /**
   * Transacciones paginadas
   */
  paginatedTransactions = (accountId: string) => computed(() => {
    const filtered = this.filteredTransactions(accountId)();
    const filters = this._filters();
    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;
    
    return filtered.slice(start, end);
  });

  /**
   * Total de páginas
   */
  totalPages = (accountId: string) => computed(() => {
    const filtered = this.filteredTransactions(accountId)();
    const filters = this._filters();
    return Math.ceil(filtered.length / filters.pageSize);
  });

  /**
   * Calcula estadísticas mensuales para una cuenta
   */
  monthlyStats = (accountId: string) => computed<AccountMonthlyStats>(() => {
    const allTransactions = this.transactionService.transactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Mes actual
    const currentMonthTxs = allTransactions.filter(tx => {
      const dateStr = tx.date || tx.transaction_date;
      if (!dateStr) return false;
      const txDate = new Date(dateStr);
      return (
        tx.account_id === accountId &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });

    const monthlyIncome = currentMonthTxs
      .filter(tx => (tx.type || tx.transaction_type) === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const monthlyExpenses = currentMonthTxs
      .filter(tx => (tx.type || tx.transaction_type) === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Mes anterior
    const prevMonth = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthTxs = allTransactions.filter(tx => {
      const dateStr = tx.date || tx.transaction_date;
      if (!dateStr) return false;
      const txDate = new Date(dateStr);
      return (
        tx.account_id === accountId &&
        txDate.getMonth() === prevMonth.getMonth() &&
        txDate.getFullYear() === prevMonth.getFullYear()
      );
    });

    const prevMonthIncome = prevMonthTxs
      .filter(tx => (tx.type || tx.transaction_type) === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const prevMonthExpenses = prevMonthTxs
      .filter(tx => (tx.type || tx.transaction_type) === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Calcular variaciones
    const incomeVariation = this.calculateVariation(prevMonthIncome, monthlyIncome);
    const expenseVariation = this.calculateVariation(prevMonthExpenses, monthlyExpenses);
    const balanceVariation = this.calculateVariation(
      prevMonthIncome - prevMonthExpenses,
      monthlyIncome - monthlyExpenses
    );

    return {
      monthlyIncome,
      monthlyExpenses,
      incomeVariation,
      expenseVariation,
      balanceVariation
    };
  });

  /**
   * Obtiene la tendencia de balance de los últimos 30 días
   */
  balanceTrend = (accountId: string) => computed<BalanceTrendPoint[]>(() => {
    const allTransactions = this.transactionService.transactions();
    const now = new Date();
    const days = 30;
    const trendData: BalanceTrendPoint[] = [];

    let runningBalance = 0;

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];

      const dayTransactions = allTransactions.filter(tx => {
        const dateStr = tx.date || tx.transaction_date;
        if (!dateStr) return false;
        const txDate = new Date(dateStr);
        return (
          tx.account_id === accountId &&
          txDate.toISOString().split('T')[0] === dateStr
        );
      });

      // Calcular balance del día
      const dayBalance = dayTransactions.reduce((sum, tx) => {
        const txType = tx.type || tx.transaction_type;
        return sum + (txType === 'income' ? Math.abs(tx.amount) : -Math.abs(tx.amount));
      }, 0);

      runningBalance += dayBalance;

      trendData.push({
        date: targetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        balance: runningBalance
      });
    }

    return trendData;
  });

  /**
   * Calcula el porcentaje de variación
   */
  private calculateVariation(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }
}
