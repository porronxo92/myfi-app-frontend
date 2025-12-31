import { Injectable, computed } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  balanceVariation: number;
  incomeVariation: number;
  expenseVariation: number;
}

export interface BalanceTrendData {
  month: string;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardCalculationsService {
  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  /**
   * Calcula el balance total sumando todas las cuentas
   */
  totalBalance = computed(() => {
    const accounts = this.accountService.accounts();
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  });

  /**
   * Calcula los ingresos del mes actual
   */
  monthlyIncome = computed(() => {
    const transactions = this.transactionService.transactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(tx => {
        const dateStr = tx.date || tx.transaction_date;
        if (!dateStr) return false;
        const txDate = new Date(dateStr);
        return (
          (tx.type || tx.transaction_type) === 'income' &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  });

  /**
   * Calcula los gastos del mes actual
   */
  monthlyExpenses = computed(() => {
    const transactions = this.transactionService.transactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(tx => {
        const dateStr = tx.date || tx.transaction_date;
        if (!dateStr) return false;
        const txDate = new Date(dateStr);
        return (
          (tx.type || tx.transaction_type) === 'expense' &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  });

  /**
   * Calcula los ingresos del mes anterior
   */
  private previousMonthIncome = computed(() => {
    const transactions = this.transactionService.transactions();
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = previousMonth.getMonth();
    const prevYear = previousMonth.getFullYear();

    return transactions
      .filter(tx => {
        const dateStr = tx.date || tx.transaction_date;
        if (!dateStr) return false;
        const txDate = new Date(dateStr);
        return (
          (tx.type || tx.transaction_type) === 'income' &&
          txDate.getMonth() === prevMonth &&
          txDate.getFullYear() === prevYear
        );
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  });

  /**
   * Calcula los gastos del mes anterior
   */
  private previousMonthExpenses = computed(() => {
    const transactions = this.transactionService.transactions();
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = previousMonth.getMonth();
    const prevYear = previousMonth.getFullYear();

    return transactions
      .filter(tx => {
        const dateStr = tx.date || tx.transaction_date;
        if (!dateStr) return false;
        const txDate = new Date(dateStr);
        return (
          (tx.type || tx.transaction_type) === 'expense' &&
          txDate.getMonth() === prevMonth &&
          txDate.getFullYear() === prevYear
        );
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  });

  /**
   * Calcula la variación porcentual del balance respecto al mes anterior
   */
  balanceVariation = computed(() => {
    const current = this.monthlyIncome() - this.monthlyExpenses();
    const previous = this.previousMonthIncome() - this.previousMonthExpenses();
    return this.calculateVariation(previous, current);
  });

  /**
   * Calcula la variación porcentual de ingresos respecto al mes anterior
   */
  incomeVariation = computed(() => {
    const current = this.monthlyIncome();
    const previous = this.previousMonthIncome();
    return this.calculateVariation(previous, current);
  });

  /**
   * Calcula la variación porcentual de gastos respecto al mes anterior
   */
  expenseVariation = computed(() => {
    const current = this.monthlyExpenses();
    const previous = this.previousMonthExpenses();
    return this.calculateVariation(previous, current);
  });

  /**
   * Obtiene la tendencia de balance de los últimos 6 meses
   */
  balanceTrend = computed<BalanceTrendData[]>(() => {
    const transactions = this.transactionService.transactions();
    const now = new Date();
    const monthsData: BalanceTrendData[] = [];

    // Generar datos para los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter(tx => {
        const dateStr = tx.date || tx.transaction_date;
        if (!dateStr) return false;
        const txDate = new Date(dateStr);
        return (
          txDate.getMonth() === targetDate.getMonth() &&
          txDate.getFullYear() === targetDate.getFullYear()
        );
      });

      // Calcular balance acumulado del mes
      const monthBalance = monthTransactions.reduce((sum, tx) => {
        const txType = tx.type || tx.transaction_type;
        return sum + (txType === 'income' ? Math.abs(tx.amount) : -Math.abs(tx.amount));
      }, 0);

      monthsData.push({
        month: targetDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        balance: monthBalance
      });
    }

    return monthsData;
  });

  /**
   * Calcula el porcentaje de variación entre dos valores
   */
  private calculateVariation(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  /**
   * Obtiene el resumen completo del dashboard
   */
  getSummary = computed<DashboardSummary>(() => ({
    totalBalance: this.totalBalance(),
    monthlyIncome: this.monthlyIncome(),
    monthlyExpenses: this.monthlyExpenses(),
    balanceVariation: this.balanceVariation(),
    incomeVariation: this.incomeVariation(),
    expenseVariation: this.expenseVariation()
  }));
}
