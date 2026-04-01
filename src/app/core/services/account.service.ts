import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, CreateAccountDto } from '../models/account.model';
import { LoggerService } from './logger.service';

/**
 * Interfaz para respuesta paginada del backend
 */
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
export class AccountService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private apiUrl = `${environment.apiUrl}/accounts`;

  // State signals
  accounts = signal<Account[]>([]);
  totalBalance = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getAccounts(): Observable<Account[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<PaginatedResponse<Account>>(this.apiUrl, {
      withCredentials: true  // Enviar cookies HTTP-only con JWT
    }).pipe(
      map(response => response.items), // Extraer el array de items
      tap({
        next: (accounts) => {
          this.accounts.set(accounts);
          this.calculateTotalBalance(accounts);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar las cuentas');
          this.loading.set(false);
          this.logger.error('Error loading accounts');
        }
      })
    );
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  createAccount(account: CreateAccountDto): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, account, {
      withCredentials: true
    }).pipe(
      tap(() => this.getAccounts().subscribe())
    );
  }

  updateAccount(id: number, account: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${id}`, account, {
      withCredentials: true
    }).pipe(
      tap(() => this.getAccounts().subscribe())
    );
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    }).pipe(
      tap(() => this.getAccounts().subscribe())
    );
  }

  private calculateTotalBalance(accounts: Account[]): void {
    const total = accounts
      .filter(acc => acc.is_active)
      .reduce((sum, acc) => sum + acc.balance, 0);
    this.totalBalance.set(total);
  }
}
