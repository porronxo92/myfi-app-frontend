import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../../core/services/category.service';
import { AccountDetailService } from '../services/account-detail.service';
import { Transaction } from '../../../core/models/transaction.model';
import { TransactionTableComponent } from '../../../shared/components/transaction-table.component';

@Component({
  selector: 'app-account-transactions-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TransactionTableComponent],
  template: `
    <div class="transactions-section">
      <!-- Header con filtros -->
      <div class="section-header">
        <h2 class="section-title">Movimientos Recientes</h2>
        <div class="header-actions">
          <button class="btn-action secondary" (click)="onTransfer.emit()">
            <mat-icon>swap_horiz</mat-icon>
            Transferir
          </button>
          <button class="btn-action primary" (click)="onAddTransaction.emit()">
            <mat-icon>add</mat-icon>
            Agregar movimiento
          </button>
          <button class="btn-icon" title="Exportar">
            <mat-icon>download</mat-icon>
          </button>
          <button class="btn-icon" title="Imprimir">
            <mat-icon>print</mat-icon>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <!-- Búsqueda -->
        <div class="filter-group">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            placeholder="Buscar por concepto..."
            class="filter-input search"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange($event)"
          />
        </div>

        <!-- Categoría -->
        <select
          class="filter-select"
          [(ngModel)]="selectedCategory"
          (ngModelChange)="onCategoryChange($event)"
        >
          <option [value]="null">Todas las categorías</option>
          <option *ngFor="let category of categories()" [value]="category.id">
            {{ category.name }}
          </option>
        </select>

        <!-- Tipo de transacción -->
        <select
          class="filter-select"
          [(ngModel)]="selectedTransactionType"
          (ngModelChange)="onTransactionTypeChange($event)"
        >
          <option value="all">Todos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
        </select>

        <!-- Rango temporal -->
        <input
          type="date"
          class="filter-input date"
          placeholder="Desde"
          [(ngModel)]="startDate"
          (ngModelChange)="onDateChange()"
        />
        <input
          type="date"
          class="filter-input date"
          placeholder="Hasta"
          [(ngModel)]="endDate"
          (ngModelChange)="onDateChange()"
        />

        <button class="btn-reset" (click)="resetFilters()" *ngIf="hasActiveFilters()">
          Limpiar filtros
        </button>
      </div>

      <!-- Tabla compartida -->
      <app-transaction-table
        [transactions]="transactions"
        [showPagination]="true"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [totalItems]="totalItems"
        [pageSize]="pageSize"
        [showTime]="false"
        [clickable]="false"
        [itemLabel]="'movimientos'"
        [emptyMessage]="'No se encontraron movimientos'"
        [emptySubtext]="'Intenta ajustar los filtros o añade tu primera transacción'"
        (pageChange)="onPageChange.emit($event)"
      ></app-transaction-table>
    </div>
  `,
  styles: [`
    .transactions-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      white-space: nowrap;
    }

    .btn-action.primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }

    .btn-action.primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
    }

    .btn-action.secondary {
      background: white;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }

    .btn-action.secondary:hover {
      background: #eff6ff;
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-icon:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .filters-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      align-items: center;
      flex-wrap: nowrap;
    }

    .filter-group {
      position: relative;
      flex: 2;
      min-width: 180px;
    }

    .search-icon {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .filter-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .filter-input.search {
      padding-left: 2.75rem;
    }

    .filter-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9375rem;
      background: white;
      cursor: pointer;
      flex: 1;
      min-width: 140px;
    }

    .filter-input.date {
      flex: 1;
      min-width: 140px;
    }

    .btn-reset {
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-reset:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 1.5rem;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
    }

    .transactions-table thead {
      background: #f8fafc;
    }

    .transactions-table th {
      padding: 0.875rem 1rem;
      text-align: left;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .transactions-table th.text-right {
      text-align: right;
    }

    .transaction-row {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s;
    }

    .transaction-row:hover {
      background: #f8fafc;
    }

    .transactions-table td {
      padding: 1rem;
      font-size: 0.9375rem;
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .date {
      font-weight: 500;
      color: #0f172a;
    }

    .time {
      font-size: 0.8125rem;
      color: #94a3b8;
    }

    .concept-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .category-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #f1f5f9;
      padding: 6px;
    }

    .category-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .category-icon.income {
      background: #dcfce7;
    }

    .category-icon.expense {
      background: #fee2e2;
    }

    .category-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .amount {
      font-weight: 600;
      font-size: 1rem;
    }

    .amount.income {
      color: #16a34a;
    }

    .amount.expense {
      color: #dc2626;
    }

    .status-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .status-badge.completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .text-right {
      text-align: right;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #94a3b8;
    }

    .empty-state svg {
      margin: 0 auto 1.5rem;
    }

    .empty-text {
      font-size: 1.125rem;
      font-weight: 600;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .empty-subtext {
      font-size: 0.9375rem;
      color: #94a3b8;
      margin: 0;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: #64748b;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-indicator {
      font-size: 0.875rem;
      color: #0f172a;
      font-weight: 500;
    }

    .btn-page {
      width: 32px;
      height: 32px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled) {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 1024px) {
      .filters-bar {
        flex-wrap: wrap;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }

      .btn-action {
        flex: 1;
        min-width: 140px;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-group,
      .filter-select,
      .filter-input.date {
        width: 100%;
        min-width: unset;
        flex: 1;
      }

      .btn-action span {
        display: none;
      }

      .btn-action {
        min-width: auto;
        padding: 0.625rem;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class AccountTransactionsTableComponent {
  @Input() transactions: Transaction[] = [];
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() pageSize: number = 10;

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onFilterChange = new EventEmitter<void>();
  @Output() onTransfer = new EventEmitter<void>();
  @Output() onAddTransaction = new EventEmitter<void>();

  private categoryService = inject(CategoryService);
  private accountDetailService = inject(AccountDetailService);

  categories = this.categoryService.categories;

  searchTerm: string = '';
  selectedCategory: string | null = null;
  selectedTransactionType: 'all' | 'income' | 'expense' = 'all';
  startDate: string | null = null;
  endDate: string | null = null;

  get rangeStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  onSearchChange(term: string): void {
    this.accountDetailService.updateFilters({ searchTerm: term, page: 1 });
    this.onFilterChange.emit();
  }

  onCategoryChange(categoryId: string | null): void {
    this.accountDetailService.updateFilters({ categoryId, page: 1 });
    this.onFilterChange.emit();
  }

  onTransactionTypeChange(transactionType: 'all' | 'income' | 'expense'): void {
    this.accountDetailService.updateFilters({ transactionType, page: 1 });
    this.onFilterChange.emit();
  }

  onDateChange(): void {
    this.accountDetailService.updateFilters({
      startDate: this.startDate,
      endDate: this.endDate,
      page: 1
    });
    this.onFilterChange.emit();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedTransactionType = 'all';
    this.startDate = null;
    this.endDate = null;
    this.accountDetailService.resetFilters();
    this.onFilterChange.emit();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory || this.selectedTransactionType !== 'all' || this.startDate || this.endDate);
  }
}
