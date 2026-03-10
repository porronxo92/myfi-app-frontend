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
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      padding: var(--space-5);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-5);
    }

    .section-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .header-actions {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 100ms ease;
      border: none;
      white-space: nowrap;
    }

    .btn-action.primary {
      background: var(--color-accent);
      color: var(--color-slate-900);
    }

    .btn-action.primary:hover {
      background: var(--color-accent-hover);
    }

    .btn-action.secondary {
      background: transparent;
      color: var(--color-accent);
      border: 1px solid var(--color-accent);
    }

    .btn-action.secondary:hover {
      background: var(--color-accent-subtle);
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: var(--border-subtle);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 100ms ease;
      flex-shrink: 0;
    }

    .btn-icon:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .filters-bar {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
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
      left: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 18px;
    }

    .filter-input {
      width: 100%;
      padding: var(--space-3);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-family: var(--font-ui);
      color: var(--text-primary);
      transition: border-color 100ms ease;
    }

    .filter-input.search {
      padding-left: 2.5rem;
    }

    .filter-input::placeholder {
      color: var(--text-muted);
    }

    .filter-input:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .filter-select {
      padding: var(--space-3);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-family: var(--font-ui);
      color: var(--text-primary);
      cursor: pointer;
      flex: 1;
      min-width: 140px;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .filter-select option {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .filter-input.date {
      flex: 1;
      min-width: 140px;
    }

    .btn-reset {
      padding: var(--space-3) var(--space-4);
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 100ms ease;
    }

    .btn-reset:hover {
      border-color: var(--color-negative);
      color: var(--color-negative);
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: var(--space-5);
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
    }

    .transactions-table thead {
      background: var(--bg-elevated);
    }

    .transactions-table th {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .transactions-table th.text-right {
      text-align: right;
    }

    .transaction-row {
      border-bottom: 1px solid var(--color-slate-700);
      transition: background 100ms ease;
    }

    .transaction-row:hover {
      background: var(--bg-elevated);
    }

    .transactions-table td {
      padding: var(--space-4);
      font-size: 0.8125rem;
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .date {
      font-weight: 500;
      color: var(--text-primary);
    }

    .time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .concept-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .category-icon {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--bg-elevated);
      padding: 4px;
    }

    .category-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .category-icon.income {
      background: rgba(34, 160, 107, 0.15);
    }

    .category-icon.expense {
      background: rgba(202, 53, 33, 0.15);
    }

    .category-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      background: var(--bg-elevated);
      color: var(--text-secondary);
    }

    .amount {
      font-family: var(--font-data);
      font-weight: 600;
      font-size: 0.875rem;
    }

    .amount.income {
      color: var(--color-positive);
    }

    .amount.expense {
      color: var(--color-negative);
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.completed {
      background: rgba(34, 160, 107, 0.15);
      color: var(--color-positive);
    }

    .text-right {
      text-align: right;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-8) var(--space-5);
      color: var(--text-muted);
    }

    .empty-state svg {
      margin: 0 auto var(--space-5);
    }

    .empty-text {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin: 0 0 var(--space-2) 0;
    }

    .empty-subtext {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: 0;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-slate-700);
    }

    .pagination-info {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .page-indicator {
      font-family: var(--font-data);
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .btn-page {
      width: 28px;
      height: 28px;
      border: var(--border-subtle);
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 100ms ease;
    }

    .btn-page:hover:not(:disabled) {
      border-color: var(--color-accent);
      color: var(--color-accent);
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
        gap: var(--space-3);
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
        padding: var(--space-3);
      }

      .pagination {
        flex-direction: column;
        gap: var(--space-3);
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
