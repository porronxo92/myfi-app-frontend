import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction, CreateTransactionDto } from '../models/transaction.model';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transactions`;

  // State signals
  transactions = signal<Transaction[]>([]);
  recentTransactions = signal<Transaction[]>([]);
  monthlyIncome = signal<number>(0);
  monthlyExpenses = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getTransactions(params?: {
    start_date?: string;
    end_date?: string;
    account_id?: string;
    category_id?: number;
  }): Observable<Transaction[]> {
    this.loading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams();
    if (params?.start_date) httpParams = httpParams.set('start_date', params.start_date);
    if (params?.end_date) httpParams = httpParams.set('end_date', params.end_date);
    if (params?.account_id) httpParams = httpParams.set('account_id', params.account_id);
    if (params?.category_id) httpParams = httpParams.set('category_id', params.category_id.toString());

    return this.http.get<PaginatedResponse<Transaction>>(this.apiUrl, { params: httpParams }).pipe(
      map(response => response.items),
      tap({
        next: (transactions) => {
          this.transactions.set(transactions);
          this.updateRecentTransactions(transactions);
          this.calculateMonthlyTotals(transactions);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar las transacciones');
          this.loading.set(false);
          console.error('Error loading transactions:', err);
        }
      })
    );
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction).pipe(
      tap(() => this.refreshTransactions())
    );
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction).pipe(
      tap(() => this.refreshTransactions())
    );
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshTransactions())
    );
  }

  private updateRecentTransactions(transactions: Transaction[]): void {
    // Ordenar por fecha descendente y tomar las últimas 5
    const sorted = [...transactions].sort((a, b) => {
      const dateA = a.date || a.transaction_date || '';
      const dateB = b.date || b.transaction_date || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    this.recentTransactions.set(sorted.slice(0, 5));
  }

  private calculateMonthlyTotals(transactions: Transaction[]): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const dateStr = t.date || t.transaction_date;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions
      .filter(t => (t.type || t.transaction_type) === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenses = currentMonthTransactions
      .filter(t => (t.type || t.transaction_type) === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    this.monthlyIncome.set(income);
    this.monthlyExpenses.set(expenses);
  }

  private refreshTransactions(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.getTransactions({
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }).subscribe();
  }
}
