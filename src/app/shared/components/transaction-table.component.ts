import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Transaction } from '../../core/models/transaction.model';
import { CategoryService } from '../../core/services/category.service';

/**
 * Mapeo de categorías a iconos de Material Icons
 * Estructura: nombreCategoria (normalizado) -> nombre del icono Material
 */
const CATEGORY_ICON_MAP: Record<string, string> = {
  // Gastos - Alimentación
  'supermercado': 'shopping_cart',
  'supermercados': 'shopping_cart',
  'alimentacion': 'shopping_cart',
  'restaurante': 'restaurant',
  'restaurantes': 'restaurant',
  'comida': 'fastfood',
  'comida_rapida': 'fastfood',
  'cafe': 'local_cafe',
  'cafeteria': 'local_cafe',
  
  // Gastos - Transporte
  'transporte': 'directions_car',
  'coche': 'directions_car',
  'auto': 'directions_car',
  'taxi': 'local_taxi',
  'uber': 'local_taxi',
  'cabify': 'local_taxi',
  'gasolina': 'local_gas_station',
  'combustible': 'local_gas_station',
  'parking': 'local_parking',
  'aparcamiento': 'local_parking',
  'bicicleta': 'pedal_bike',
  'metro': 'subway',
  'bus': 'directions_bus',
  'autobus': 'directions_bus',
  'tren': 'train',
  'avion': 'flight',
  
  // Gastos - Compras
  'compras': 'shopping_bag',
  'compra': 'shopping_bag',
  'compras_online': 'shopping_basket',
  'compra_online': 'shopping_basket',
  'amazon': 'store',
  'ecommerce': 'storefront',
  'tienda_online': 'storefront',
  'ropa': 'checkroom',
  'vestuario': 'checkroom',
  
  // Gastos - Vivienda
  'vivienda': 'home',
  'hogar': 'home',
  'alquiler': 'home',
  'renta': 'home',
  'hipoteca': 'house',
  'electricidad': 'bolt',
  'luz': 'bolt',
  'agua': 'water_drop',
  'gas': 'local_fire_department',
  'gas_natural': 'local_fire_department',
  'internet': 'wifi',
  'telefono': 'phone',
  'telefonia': 'phone',
  'movil': 'phone',
  
  // Gastos - Ocio y Entretenimiento
  'ocio': 'sports_esports',
  'entretenimiento': 'sports_esports',
  'deporte': 'fitness_center',
  'deportes': 'fitness_center',
  'gimnasio': 'fitness_center',
  'gym': 'fitness_center',
  'cine': 'movie',
  'peliculas': 'movie',
  'streaming': 'play_circle',
  'netflix': 'play_circle',
  'musica': 'music_note',
  'spotify': 'music_note',
  'libros': 'menu_book',
  'libro': 'menu_book',
  'lectura': 'menu_book',
  
  // Gastos - Viajes
  'viaje': 'flight_takeoff',
  'viajes': 'flight_takeoff',
  'turismo': 'flight_takeoff',
  'hotel': 'hotel',
  'hoteles': 'hotel',
  'alojamiento': 'hotel',
  'vacaciones': 'beach_access',
  
  // Gastos - Salud
  'salud': 'medical_services',
  'sanidad': 'medical_services',
  'farmacia': 'medication',
  'farmacias': 'medication',
  'medicamentos': 'medication',
  'medico': 'local_hospital',
  'doctor': 'local_hospital',
  'hospital': 'local_hospital',
  'seguro': 'health_and_safety',
  'seguro_medico': 'health_and_safety',
  'seguro_salud': 'health_and_safety',
  
  // Gastos - Educación
  'educacion': 'school',
  'cursos': 'cast_for_education',
  
  // Gastos - Servicios
  'bizum': 'currency_exchange',
  'transferencia': 'sync_alt',
  'regalos': 'card_giftcard',
  'donaciones': 'volunteer_activism',
  
  // Gastos - Personales
  'gastos_personales': 'person',
  'belleza': 'face',
  'peluqueria': 'content_cut',
  
  // Gastos - Mascotas
  'mascotas': 'pets',
  'veterinario': 'pets',
  
  // Gastos - Varios
  'gastos_fijos': 'receipt_long',
  'impuestos': 'account_balance',
  'multas': 'gavel',
  'sin_categorizar': 'help_outline',
  
  // Ingresos
  'salario': 'payments',
  'nomina': 'payments',
  'freelance': 'work',
  'inversiones': 'trending_up',
  'inversion': 'show_chart',
  'dividendos': 'pie_chart',
  'intereses': 'percent',
  'otros_ingresos': 'attach_money',
  'ingreso_bizum': 'currency_exchange',
  'venta': 'sell',
  'reembolso': 'receipt_long'
};

const DEFAULT_ICON = 'receipt';

/**
 * Componente reutilizable de tabla de transacciones
 * 
 * Características:
 * - Muestra transacciones en formato tabla
 * - Iconos de Material Icons para categorías
 * - Formato de moneda configurable
 * - Paginación opcional
 * - Acciones personalizables
 * - Responsive
 * 
 * @example
 * <app-transaction-table
 *   [transactions]="myTransactions"
 *   [showPagination]="true"
 *   [currentPage]="1"
 *   [totalPages]="5"
 *   [totalItems]="50"
 *   (pageChange)="handlePageChange($event)"
 *   (transactionClick)="handleClick($event)"
 * />
 */
@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  template: `
    <div class="table-container">
      <!-- Tabla -->
      <table class="transactions-table" *ngIf="transactions().length > 0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Categoría</th>
            <th class="text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            *ngFor="let tx of transactions(); trackBy: trackByTransactionId" 
            class="transaction-row"
            (click)="handleTransactionClick(tx)"
            [class.clickable]="clickable()"
          >
            <td>
              <div class="date-cell">
                <span class="date">{{ formatDate(tx.date || tx.transaction_date || '') }}</span>
              </div>
            </td>
            <td>
              <div class="concept-cell">
                <div 
                  class="category-icon" 
                  [class.income]="getTransactionType(tx) === 'income'" 
                  [class.expense]="getTransactionType(tx) === 'expense'"
                >
                  <mat-icon>{{ getCategoryIcon(tx.category_id) }}</mat-icon>
                </div>
                <span class="description">{{ tx.description }}</span>
              </div>
            </td>
            <td>
              <span 
                class="category-badge" 
                [style.background-color]="getCategoryColor(tx.category_id) + '20'"
                [style.color]="getCategoryColor(tx.category_id)"
                [style.border]="'1px solid ' + getCategoryColor(tx.category_id)"
              >
                {{ getCategoryName(tx.category_id) }}
              </span>
            </td>
            <td class="text-right">
              <span 
                class="amount" 
                [class.income]="getTransactionType(tx) === 'income'" 
                [class.expense]="getTransactionType(tx) === 'expense'"
              >
                {{ getTransactionType(tx) === 'income' ? '+' : '-' }}{{ Math.abs(tx.amount) | currency:currency():'symbol':'1.2-2' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Estado vacío -->
      <div class="empty-state" *ngIf="transactions().length === 0">
        <mat-icon class="empty-icon">receipt_long</mat-icon>
        <p class="empty-text">{{ emptyMessage() }}</p>
        <p class="empty-subtext" *ngIf="emptySubtext()">{{ emptySubtext() }}</p>
      </div>

      <!-- Paginación -->
      <div class="pagination" *ngIf="showPagination() && totalItems() > 0">
        <div class="pagination-info">
          Mostrando {{ rangeStart() }} - {{ rangeEnd() }} de {{ totalItems() }} {{ itemLabel() }}
        </div>
        <div class="pagination-controls">
          <button
            class="btn-page"
            [disabled]="currentPage() === 1"
            (click)="handlePageChange(currentPage() - 1)"
            type="button"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="page-indicator">Página {{ currentPage() }} de {{ totalPages() }}</span>
          <button
            class="btn-page"
            [disabled]="currentPage() === totalPages()"
            (click)="handlePageChange(currentPage() + 1)"
            type="button"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========================================
       TRANSACTION TABLE - INSTITUTIONAL
       ======================================== */
    
    .table-container {
      overflow-x: auto;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
    }

    /* Table Header */
    .transactions-table thead {
      background: var(--bg-elevated);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .transactions-table th {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: var(--border-default);
      white-space: nowrap;
    }

    .transactions-table th.text-right {
      text-align: right;
    }

    /* Table Rows */
    .transaction-row {
      border-bottom: var(--border-subtle);
      transition: background var(--transition-fast);
    }

    .transaction-row:hover {
      background: var(--bg-hover);
    }

    .transaction-row.clickable {
      cursor: pointer;
    }

    /* Alternating row colors - subtle */
    .transaction-row:nth-child(even) {
      background: rgba(255, 255, 255, 0.01);
    }
    
    .transaction-row:nth-child(even):hover {
      background: var(--bg-hover);
    }

    .transactions-table td {
      padding: var(--space-3) var(--space-4);
      font-size: 0.875rem;
      color: var(--text-secondary);
      vertical-align: middle;
    }

    /* Date Cell */
    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .date {
      font-family: var(--font-data);
      font-weight: 500;
      color: var(--text-secondary);
      font-size: 0.8125rem;
    }

    .time {
      font-family: var(--font-data);
      font-size: 0.75rem;
      color: var(--text-faint);
    }

    /* Concept Cell */
    .concept-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .category-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--bg-elevated);
    }

    .category-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    .category-icon.income {
      background: rgba(34, 160, 107, 0.12);
    }

    .category-icon.income mat-icon {
      color: var(--color-positive);
    }

    .category-icon.expense {
      background: rgba(202, 53, 33, 0.12);
    }

    .category-icon.expense mat-icon {
      color: var(--color-negative);
    }

    .description {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.875rem;
    }

    /* Category Badge */
    .category-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }

    /* Amount Column - Critical for finance */
    .amount {
      font-family: var(--font-data);
      font-weight: 600;
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
    }

    .amount.income {
      color: var(--color-positive);
    }

    .amount.expense {
      color: var(--color-negative);
    }

    .text-right {
      text-align: right;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-6);
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin: 0 auto var(--space-4);
      color: var(--text-faint);
      opacity: 0.6;
    }

    .empty-text {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-muted);
      margin: 0 0 var(--space-2) 0;
    }

    .empty-subtext {
      font-size: 0.8125rem;
      color: var(--text-faint);
      margin: 0;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-4);
      margin-top: var(--space-4);
      border-top: var(--border-subtle);
    }

    .pagination-info {
      font-family: var(--font-data);
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.02em;
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
      width: 32px;
      height: 32px;
      border: var(--border-subtle);
      background: transparent;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
      padding: 0;
    }

    .btn-page mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .btn-page:hover:not(:disabled) {
      border-color: var(--color-accent);
      color: var(--color-accent);
      background: var(--color-accent-subtle);
    }

    .btn-page:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .transactions-table {
        font-size: 0.8125rem;
      }

      .transactions-table th,
      .transactions-table td {
        padding: var(--space-2) var(--space-3);
      }

      .category-icon {
        width: 28px;
        height: 28px;
      }

      .category-icon mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .pagination {
        flex-direction: column;
        gap: var(--space-3);
      }
    }
  `]
})
export class TransactionTableComponent {
  // Inputs
  transactions = input.required<Transaction[]>();
  
  // Paginación
  showPagination = input<boolean>(false);
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  
  // Personalización
  currency = input<string>('EUR');
  showTime = input<boolean>(false);
  clickable = input<boolean>(false);
  itemLabel = input<string>('movimientos');
  emptyMessage = input<string>('No se encontraron transacciones');
  emptySubtext = input<string | null>('Intenta ajustar los filtros o añade tu primera transacción');
  
  // Outputs
  pageChange = output<number>();
  transactionClick = output<Transaction>();

  // Servicios
  private categoryService = inject(CategoryService);

  Math = Math;

  // Computed properties
  rangeStart = computed(() => {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  rangeEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  /**
   * Normaliza el nombre de una categoría para buscar su icono
   */
  private normalizeCategoryName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/\//g, '_')
      .replace(/-/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Obtiene el nombre de una categoría desde su ID
   */
  getCategoryName(categoryId: string | null | undefined): string {
    if (!categoryId) return 'Sin categoría';
    const category = this.categoryService.categories().find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  }

  /**
   * Obtiene el color de una categoría desde su ID
   */
  getCategoryColor(categoryId: string | null | undefined): string {
    if (!categoryId) return '#94a3b8';
    const category = this.categoryService.categories().find(c => c.id === categoryId);
    return category?.color || '#94a3b8';
  }

  /**
   * Obtiene el icono de Material para una categoría usando su ID
   */
  getCategoryIcon(categoryId: string | null | undefined): string {
    const categoryName = this.getCategoryName(categoryId);
    
    if (!categoryName || categoryName === 'Sin categoría') {
      return DEFAULT_ICON;
    }

    const normalized = this.normalizeCategoryName(categoryName);
    
    // Intenta buscar por nombre completo normalizado
    if (CATEGORY_ICON_MAP[normalized]) {
      return CATEGORY_ICON_MAP[normalized];
    }
    
    // Intenta buscar por la primera palabra (ej: "Restaurantes y Bares" -> "restaurantes")
    const firstWord = normalized.split('_')[0];
    if (CATEGORY_ICON_MAP[firstWord]) {
      return CATEGORY_ICON_MAP[firstWord];
    }
    
    // Si sigue sin encontrar, intenta buscar si alguna clave del mapa está contenida en el nombre
    const matchingKey = Object.keys(CATEGORY_ICON_MAP).find(key => 
      normalized.includes(key) || key.includes(normalized.split('_')[0])
    );
    
    if (matchingKey) {
      return CATEGORY_ICON_MAP[matchingKey];
    }
    
    return DEFAULT_ICON;
  }

  /**
   * Obtiene el tipo de transacción
   */
  getTransactionType(tx: Transaction): 'income' | 'expense' {
    return (tx.type || tx.transaction_type) as 'income' | 'expense';
  }

  /**
   * Formatea la fecha
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  /**
   * Formatea la hora
   */
  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Track by para optimizar el rendering
   */
  trackByTransactionId(index: number, tx: Transaction): string {
    return tx.id;
  }

  /**
   * Maneja el cambio de página
   */
  handlePageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  /**
   * Maneja el click en una transacción
   */
  handleTransactionClick(tx: Transaction): void {
    if (this.clickable()) {
      this.transactionClick.emit(tx);
    }
  }
}
