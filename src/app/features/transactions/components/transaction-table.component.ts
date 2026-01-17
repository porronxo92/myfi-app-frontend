import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Transaction } from '../../../core/models/transaction.model';
import { Account } from '../../../core/models/account.model';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="table-container">
      <div class="table-header">
        <h2 class="table-title">Listado de Movimientos</h2>
        <p class="table-subtitle">Mostrando {{ startIndex() + 1 }} - {{ endIndex() }} de {{ total() }} transacciones</p>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="transactions-table">
          <thead>
            <tr>
              <th class="sortable" (click)="sortChange.emit('date')">
                <div class="th-content">
                  <span>Fecha</span>
                  <span class="sort-icon" *ngIf="sortField() === 'date'">
                    {{ sortDirection() === 'desc' ? '▼' : '▲' }}
                  </span>
                </div>
              </th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Cuenta</th>
              <th class="sortable text-right" (click)="sortChange.emit('amount')">
                <div class="th-content">
                  <span>Importe</span>
                  <span class="sort-icon" *ngIf="sortField() === 'amount'">
                    {{ sortDirection() === 'desc' ? '▼' : '▲' }}
                  </span>
                </div>
              </th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of transactions()" class="transaction-row">
              <!-- Fecha -->
              <td class="date-cell">
                {{ formatDate(tx.date || tx.transaction_date) }}
              </td>

              <!-- Descripción + Icono de Categoría -->
              <td class="description-cell">
                <div class="description-content">
                  <div 
                    class="category-icon" 
                    [class.income]="isIncome(tx)" 
                    [class.expense]="isExpense(tx)"
                  >
                    <mat-icon>{{ getCategoryIcon(tx) }}</mat-icon>
                  </div>
                  <span class="description-text">{{ tx.description || 'Sin descripción' }}</span>
                </div>
              </td>

              <!-- Categoría -->
              <td class="category-cell">
                <span class="category-badge" [class]="getCategoryClass(tx)">
                  {{ tx.category_name || 'Sin categoría' }}
                </span>
              </td>

              <!-- Cuenta -->
              <td class="account-cell">
                {{ getAccountName(tx.account_id) }}
              </td>

              <!-- Importe -->
              <td class="amount-cell text-right">
                <span class="amount" [class.positive]="isIncome(tx)" [class.negative]="isExpense(tx)">
                  {{ formatAmount(tx) }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="actions-cell text-center">
                <div class="actions-buttons">
                  <button class="btn-action btn-edit" (click)="editTransaction.emit(tx)" title="Editar">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button class="btn-action btn-delete" (click)="deleteTransaction.emit(tx)" title="Eliminar">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="transactions().length === 0" class="empty-row">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="empty-title">No hay transacciones</p>
                  <p class="empty-text">Intenta ajustar los filtros o añade nuevas transacciones</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pagination" *ngIf="totalPages() > 1">
        <button 
          class="btn-page" 
          [disabled]="page() === 1"
          (click)="pageChange.emit(page() - 1)">
          Anterior
        </button>
        
        <div class="page-numbers">
          <button 
            *ngFor="let p of visiblePages()"
            class="btn-page-number"
            [class.active]="p === page()"
            (click)="pageChange.emit(p)">
            {{ p }}
          </button>
        </div>
        
        <button 
          class="btn-page" 
          [disabled]="page() === totalPages()"
          (click)="pageChange.emit(page() + 1)">
          Siguiente
        </button>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-header {
      margin-bottom: 1.5rem;
    }

    .table-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .table-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .table-responsive {
      overflow-x: auto;
      margin-bottom: 1.5rem;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background 0.2s;
    }

    th.sortable:hover {
      background: #f1f5f9;
    }

    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-icon {
      font-size: 0.75rem;
      color: #3b82f6;
    }

    th.text-right,
    td.text-right {
      text-align: right;
    }

    th.text-center,
    td.text-center {
      text-align: center;
    }

    .transaction-row {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s;
    }

    .transaction-row:hover {
      background: #f8fafc;
    }

    td {
      padding: 1rem;
      font-size: 0.875rem;
      color: #0f172a;
    }

    .date-cell {
      font-size: 0.8125rem;
      color: #64748b;
      white-space: nowrap;
    }

    .description-content {
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

    .category-icon mat-icon {
      width: 100%;
      height: 100%;
      font-size: 18px;
      line-height: 18px;
    }

    .category-icon.income {
      background: #dcfce7;
      color: #166534;
    }

    .category-icon.expense {
      background: #fee2e2;
      color: #991b1b;
    }

    .description-text {
      font-weight: 500;
    }

    .category-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .category-badge.income {
      background: #dcfce7;
      color: #166534;
    }

    .category-badge.expense {
      background: #fee2e2;
      color: #991b1b;
    }

    .category-badge.transfer {
      background: #dbeafe;
      color: #1e40af;
    }

    .account-cell {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .amount {
      font-weight: 600;
      font-size: 0.9375rem;
    }

    .amount.positive {
      color: #10b981;
    }

    .amount.negative {
      color: #ef4444;
    }

    .actions-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn-action {
      padding: 0.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      background: transparent;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-action:hover {
      background: #f1f5f9;
    }

    .btn-edit:hover {
      color: #3b82f6;
      background: #eff6ff;
    }

    .btn-delete:hover {
      color: #ef4444;
      background: #fef2f2;
    }

    .empty-row td {
      padding: 3rem 1rem;
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;
    }

    .empty-state svg {
      margin: 0 auto 1rem;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .empty-text {
      font-size: 0.875rem;
      margin: 0;
    }

    /* Paginación */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;
    }

    .btn-page,
    .btn-page-number {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled),
    .btn-page-number:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-page-number.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    @media (max-width: 768px) {
      .table-container {
        padding: 1rem;
      }

      .transactions-table {
        font-size: 0.8125rem;
      }

      th, td {
        padding: 0.5rem;
      }

      .category-icon {
        font-size: 1rem;
      }

      .description-text {
        font-size: 0.8125rem;
      }

      .actions-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      .pagination {
        flex-direction: column;
      }
    }
  `]
})
export class TransactionTableComponent {
  private categoryService = inject(CategoryService);

  transactions = input.required<Transaction[]>();
  total = input.required<number>();
  page = input.required<number>();
  pageSize = input.required<number>();
  sortField = input<'date' | 'amount' | null>(null);
  sortDirection = input<'asc' | 'desc'>('desc');
  accounts = input.required<Account[]>();

  pageChange = output<number>();
  sortChange = output<'date' | 'amount'>();
  editTransaction = output<Transaction>();
  deleteTransaction = output<Transaction>();

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  
  startIndex = computed(() => (this.page() - 1) * this.pageSize());
  endIndex = computed(() => Math.min(this.startIndex() + this.pageSize(), this.total()));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1, total);
      } else if (current >= total - 3) {
        pages.push(1, -1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1, -1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1, total);
      }
    }

    return pages;
  });

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatAmount(tx: Transaction): string {
    const type = tx.type || tx.transaction_type;
    const amount = Math.abs(tx.amount);
    const sign = type === 'income' ? '+' : '-';
    return `${sign}${amount.toFixed(2)}€`;
  }

  isIncome(tx: Transaction): boolean {
    return (tx.type || tx.transaction_type) === 'income';
  }

  isExpense(tx: Transaction): boolean {
    return (tx.type || tx.transaction_type) === 'expense';
  }

  getCategoryClass(tx: Transaction): string {
    const type = tx.type || tx.transaction_type;
    return type || 'transfer';
  }

  getCategoryIcon(tx: Transaction): string {
    const categoryId = tx.category_id;
    if (!categoryId) return 'receipt'; // Default para transferencias sin categoría

    // Obtener nombre de categoría normalizado
    const category = this.categoryService.categories().find(c => c.id === categoryId);
    const categoryName = (category?.name || tx.category_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Mapeo de categorías a Material Icons (igual que en account-detail)
    // Gastos - Alimentación
    if (categoryName.includes('supermercado')) return 'shopping_cart';
    if (categoryName.includes('restaurante')) return 'restaurant';
    if (categoryName.includes('comida')) return 'fastfood';
    if (categoryName.includes('cafe')) return 'local_cafe';

    // Gastos - Transporte
    if (categoryName.includes('transporte') || categoryName.includes('coche')) return 'directions_car';
    if (categoryName.includes('taxi') || categoryName.includes('uber')) return 'local_taxi';
    if (categoryName.includes('gasolina') || categoryName.includes('combustible')) return 'local_gas_station';
    if (categoryName.includes('parking') || categoryName.includes('aparcamiento')) return 'local_parking';
    if (categoryName.includes('bicicleta')) return 'pedal_bike';
    if (categoryName.includes('metro')) return 'subway';
    if (categoryName.includes('bus') || categoryName.includes('autobus')) return 'directions_bus';
    if (categoryName.includes('tren')) return 'train';
    if (categoryName.includes('avion')) return 'flight';

    // Gastos - Compras
    if (categoryName.includes('compras')) return 'shopping_bag';
    if (categoryName.includes('ropa') || categoryName.includes('vestuario')) return 'checkroom';

    // Gastos - Vivienda
    if (categoryName.includes('vivienda') || categoryName.includes('hogar') || categoryName.includes('alquiler')) return 'home';
    if (categoryName.includes('hipoteca')) return 'house';
    if (categoryName.includes('electricidad') || categoryName.includes('luz')) return 'bolt';
    if (categoryName.includes('agua')) return 'water_drop';
    if (categoryName.includes('gas')) return 'local_fire_department';
    if (categoryName.includes('internet')) return 'wifi';
    if (categoryName.includes('telefono') || categoryName.includes('movil')) return 'phone';

    // Gastos - Ocio
    if (categoryName.includes('ocio') || categoryName.includes('entretenimiento')) return 'sports_esports';
    if (categoryName.includes('deporte') || categoryName.includes('gimnasio')) return 'fitness_center';
    if (categoryName.includes('cine') || categoryName.includes('peliculas')) return 'movie';
    if (categoryName.includes('streaming') || categoryName.includes('netflix')) return 'play_circle';
    if (categoryName.includes('musica') || categoryName.includes('spotify')) return 'music_note';
    if (categoryName.includes('libros') || categoryName.includes('lectura')) return 'menu_book';

    // Gastos - Viajes
    if (categoryName.includes('viaje') || categoryName.includes('turismo')) return 'flight_takeoff';
    if (categoryName.includes('hotel') || categoryName.includes('alojamiento')) return 'hotel';
    if (categoryName.includes('vacaciones')) return 'beach_access';

    // Gastos - Salud
    if (categoryName.includes('salud') || categoryName.includes('sanidad')) return 'medical_services';
    if (categoryName.includes('farmacia') || categoryName.includes('medicamentos')) return 'medication';
    if (categoryName.includes('medico') || categoryName.includes('doctor') || categoryName.includes('hospital')) return 'local_hospital';
    if (categoryName.includes('seguro')) return 'health_and_safety';

    // Gastos - Educación
    if (categoryName.includes('educacion')) return 'school';
    if (categoryName.includes('cursos')) return 'cast_for_education';

    // Gastos - Servicios
    if (categoryName.includes('bizum')) return 'currency_exchange';
    if (categoryName.includes('transferencia')) return 'sync_alt';
    if (categoryName.includes('regalos')) return 'card_giftcard';
    if (categoryName.includes('donaciones')) return 'volunteer_activism';

    // Gastos - Personales
    if (categoryName.includes('belleza')) return 'face';
    if (categoryName.includes('peluqueria')) return 'content_cut';

    // Gastos - Mascotas
    if (categoryName.includes('mascotas') || categoryName.includes('veterinario')) return 'pets';

    // Gastos - Varios
    if (categoryName.includes('gastos_fijos')) return 'receipt_long';
    if (categoryName.includes('impuestos')) return 'account_balance';
    if (categoryName.includes('multas')) return 'gavel';

    // Ingresos
    if (categoryName.includes('salario') || categoryName.includes('nomina')) return 'payments';
    if (categoryName.includes('freelance')) return 'work';
    if (categoryName.includes('inversiones') || categoryName.includes('inversion')) return 'trending_up';
    if (categoryName.includes('dividendos')) return 'pie_chart';
    if (categoryName.includes('intereses')) return 'percent';
    if (categoryName.includes('venta')) return 'sell';
    if (categoryName.includes('reembolso')) return 'receipt_long';

    return 'receipt'; // Default
  }

  getAccountName(accountId: string): string {
    const account = this.accounts().find(a => a.id === accountId);
    return account?.name || 'Cuenta desconocida';
  }
}