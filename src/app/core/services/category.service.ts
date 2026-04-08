import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryDto } from '../models/category.model';
import { LoggerService } from './logger.service';

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
export class CategoryService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private apiUrl = `${environment.apiUrl}/categories`;

  // State signals
  categories = signal<Category[]>([]);
  incomeCategories = signal<Category[]>([]);
  expenseCategories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  getCategories(): Observable<Category[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<PaginatedResponse<Category>>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => response.items),
      tap({
        next: (categories) => {
          this.categories.set(categories);
          this.filterCategories(categories);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar las categorías');
          this.loading.set(false);
          this.logger.error('Error loading categories');
        }
      })
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  getAllAvailableCategories(type?: 'income' | 'expense'): Observable<Category[]> {
    this.loading.set(true);
    this.error.set(null);

    let url = `${this.apiUrl}/available/all`;
    if (type) {
      url += `?type=${type}`;
    }

    return this.http.get<Category[]>(url, {
      withCredentials: true
    }).pipe(
      tap({
        next: (categories) => {
          // Only update global state if loading ALL categories (no filter)
          // This prevents filtered requests from overwriting the global category list
          if (!type) {
            this.categories.set(categories);
            this.filterCategories(categories);
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar las categorías');
          this.loading.set(false);
          this.logger.error('Error loading categories');
        }
      })
    );
  }

  createCategory(category: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category, {
      withCredentials: true
    }).pipe(
      tap(() => this.getAllAvailableCategories().subscribe())
    );
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category, {
      withCredentials: true
    }).pipe(
      tap(() => this.getAllAvailableCategories().subscribe())
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    }).pipe(
      tap(() => this.getAllAvailableCategories().subscribe())
    );
  }

  private filterCategories(categories: Category[]): void {
    const income = categories.filter(c => (c.type || c.category_type) === 'income');
    const expense = categories.filter(c => (c.type || c.category_type) === 'expense');
    
    this.incomeCategories.set(income);
    this.expenseCategories.set(expense);
  }
}
