import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Transaction } from '../../../core/models/transaction.model';
import { TransactionTableComponent as SharedTransactionTableComponent } from '../../../shared/components/transaction-table.component';

/**
 * Wrapper del componente compartido de tabla de transacciones
 * para la página de gestión de transacciones
 */
@Component({
  selector: 'app-transactions-table-wrapper',
  standalone: true,
  imports: [CommonModule, MatIconModule, SharedTransactionTableComponent],
  template: `
    <div class="table-wrapper">
      <div class="table-header">
        <h2 class="table-title">Transacciones</h2>
        <p class="table-count">{{ total() }} resultado{{ total() !== 1 ? 's' : '' }}</p>
      </div>

      <app-transaction-table
        [transactions]="transactions()"
        [showPagination]="true"
        [currentPage]="page()"
        [totalPages]="totalPages()"
        [totalItems]="total()"
        [pageSize]="pageSize()"
        [itemLabel]="'transacciones'"
        [clickable]="true"
        [showTime]="true"
        [emptyMessage]="'No se encontraron transacciones'"
        [emptySubtext]="'Intenta ajustar los filtros o añade nuevas transacciones'"
        (pageChange)="pageChange.emit($event)"
        (transactionClick)="handleTransactionClick($event)"
      ></app-transaction-table>
      
      <!-- Acciones flotantes para móvil -->
      <div class="mobile-actions" *ngIf="showMobileActions() && selectedTransaction()">
        <button class="btn-mobile-action" (click)="editTransaction.emit(selectedTransaction()!)">
          <mat-icon>edit</mat-icon>
          Editar
        </button>
        <button class="btn-mobile-action delete" (click)="deleteTransaction.emit(selectedTransaction()!)">
          <mat-icon>delete</mat-icon>
          Eliminar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .table-wrapper {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .table-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .table-count {
      color: #64748b;
      font-size: 0.9375rem;
      margin: 0;
    }

    .mobile-actions {
      display: none;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-mobile-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
    }

    .btn-mobile-action:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-mobile-action.delete {
      color: #ef4444;
      border-color: #fecaca;
    }

    .btn-mobile-action.delete:hover {
      background: #fef2f2;
    }

    @media (max-width: 768px) {
      .mobile-actions {
        display: flex;
      }
    }
  `]
})
export class TransactionTableComponent {
  transactions = input.required<Transaction[]>();
  total = input.required<number>();
  page = input.required<number>();
  pageSize = input.required<number>();

  pageChange = output<number>();
  editTransaction = output<Transaction>();
  deleteTransaction = output<Transaction>();

  selectedTransaction = signal<Transaction | null>(null);
  showMobileActions = signal<boolean>(false);

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));

  handleTransactionClick(tx: Transaction): void {
    this.selectedTransaction.set(tx);
    this.showMobileActions.set(true);
    
    // En desktop, podría abrir un modal de detalles
    // Por ahora solo emitimos el evento de edición en desktop
    if (window.innerWidth > 768) {
      this.editTransaction.emit(tx);
    }
  }
}