import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="transactions-section">
      <div class="section-header">
        <h2 class="section-title">Últimas Transacciones</h2>
        <a href="/transactions" class="view-all">Ver todas →</a>
      </div>

      <!-- Estado vacío -->
      <div class="empty-state" *ngIf="recentTransactions().length === 0">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h3 class="empty-title">No hay transacciones aún</h3>
        <p class="empty-description">Tus transacciones aparecerán aquí cuando empieces a registrarlas</p>
      </div>

      <!-- Lista de transacciones -->
      <div class="transactions-list" *ngIf="recentTransactions().length > 0">
        <div 
          class="transaction-card" 
          *ngFor="let transaction of recentTransactions(); trackBy: trackByTransactionId"
          [class.income]="(transaction.type || transaction.transaction_type) === 'income'"
          [class.expense]="(transaction.type || transaction.transaction_type) === 'expense'"
        >
          <div class="transaction-icon">
            <mat-icon>{{ getCategoryIcon(transaction.category_name) }}</mat-icon>
          </div>

          <div class="transaction-info">
            <h3 class="transaction-description">{{ transaction.description }}</h3>
            <div class="transaction-meta">
              <span class="transaction-date">{{ (transaction.date || transaction.transaction_date) | date:'dd/MM/yyyy' }}</span>
              <span class="transaction-separator">•</span>
              <span class="transaction-account">{{ transaction.account_name || 'Cuenta desconocida' }}</span>
              <span class="transaction-separator">•</span>
              <span class="transaction-category">
                {{ transaction.category_name || 'Sin categoría' }}
              </span>
            </div>
          </div>

          <div class="transaction-amount">
            <span 
              class="amount-value" 
              [class.positive]="(transaction.type || transaction.transaction_type) === 'income'"
              [class.negative]="(transaction.type || transaction.transaction_type) === 'expense'"
            >
              {{ (transaction.type || transaction.transaction_type) === 'income' ? '+' : '-' }}{{ Math.abs(transaction.amount) | currency:'EUR':'symbol':'1.2-2' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transactions-section {
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .view-all {
      font-size: 0.875rem;
      font-weight: 600;
      color: #3b82f6;
      text-decoration: none;
      transition: color 0.2s;
    }

    .view-all:hover {
      color: #2563eb;
    }

    /* Estado vacío */
    .empty-state {
      background: white;
      border-radius: 16px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      color: #cbd5e1;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .empty-description {
      color: #64748b;
      margin: 0;
    }

    /* Lista de transacciones */
    .transactions-list {
      background: white;
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .transaction-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      transition: all 0.2s;
      cursor: pointer;
    }

    .transaction-card:not(:last-child) {
      border-bottom: 1px solid #f1f5f9;
    }

    .transaction-card:hover {
      background: #f8fafc;
    }

    .transaction-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .transaction-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .transaction-card.income .transaction-icon {
      background: #dcfce7;
      color: #16a34a;
    }

    .transaction-card.expense .transaction-icon {
      background: #fee2e2;
      color: #dc2626;
    }

    .transaction-info {
      flex: 1;
      min-width: 0;
    }

    .transaction-description {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .transaction-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      flex-wrap: wrap;
    }

    .transaction-separator {
      color: #cbd5e1;
    }

    .transaction-date,
    .transaction-account,
    .transaction-category {
      white-space: nowrap;
    }

    .transaction-amount {
      flex-shrink: 0;
    }

    .amount-value {
      font-size: 1.125rem;
      font-weight: 700;
    }

    .amount-value.positive {
      color: #16a34a;
    }

    .amount-value.negative {
      color: #dc2626;
    }

    @media (max-width: 768px) {
      .transaction-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .transaction-amount {
        align-self: flex-end;
      }
    }
  `]
})
export class RecentTransactionsComponent {
  private transactionService = inject(TransactionService);

  Math = Math;
  
  // Obtener las últimas 5 transacciones usando computed
  recentTransactions = computed(() => {
    const transactions = this.transactionService.transactions();
    return [...transactions]
      .sort((a, b) => {
        const dateA = a.date || a.transaction_date || '';
        const dateB = b.date || b.transaction_date || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  });

  trackByTransactionId(index: number, transaction: any): string {
    return transaction.id;
  }

  /**
   * Obtiene el icono de Material para una categoría
   */
  getCategoryIcon(categoryName: string | null | undefined): string {
    if (!categoryName || categoryName === 'Sin categoría') {
      return 'receipt';
    }

    const normalized = this.normalizeCategoryName(categoryName);
    const iconMap = this.getCategoryIconMap();
    
    // Intenta buscar por nombre completo normalizado
    if (iconMap[normalized]) {
      return iconMap[normalized];
    }
    
    // Intenta buscar por la primera palabra
    const firstWord = normalized.split('_')[0];
    if (iconMap[firstWord]) {
      return iconMap[firstWord];
    }
    
    // Si sigue sin encontrar, intenta buscar si alguna clave está contenida
    const matchingKey = Object.keys(iconMap).find(key => 
      normalized.includes(key) || key.includes(normalized.split('_')[0])
    );
    
    if (matchingKey) {
      return iconMap[matchingKey];
    }
    
    return 'receipt';
  }

  /**
   * Normaliza el nombre de una categoría para buscar en el mapa de iconos
   */
  private normalizeCategoryName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .replace(/\s+/g, '_') // Reemplaza espacios por guiones bajos
      .replace(/[^a-z0-9_]/g, ''); // Elimina caracteres especiales
  }

  /**
   * Mapa de categorías a iconos de Material Icons
   */
  private getCategoryIconMap(): Record<string, string> {
    return {
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
      'ropa': 'checkroom',
      'vestuario': 'checkroom',
      
      // Gastos - Vivienda
      'vivienda': 'home',
      'hogar': 'home',
      'alquiler': 'home',
      'hipoteca': 'house',
      'electricidad': 'bolt',
      'luz': 'bolt',
      'agua': 'water_drop',
      'gas': 'local_fire_department',
      'internet': 'wifi',
      'telefono': 'phone',
      'movil': 'phone',
      
      // Gastos - Ocio
      'ocio': 'sports_esports',
      'entretenimiento': 'sports_esports',
      'deporte': 'fitness_center',
      'gimnasio': 'fitness_center',
      'cine': 'movie',
      'streaming': 'play_circle',
      'musica': 'music_note',
      'libros': 'menu_book',
      
      // Gastos - Viajes
      'viaje': 'flight_takeoff',
      'viajes': 'flight_takeoff',
      'hotel': 'hotel',
      'vacaciones': 'beach_access',
      
      // Gastos - Salud
      'salud': 'medical_services',
      'farmacia': 'medication',
      'medico': 'local_hospital',
      'seguro': 'health_and_safety',
      
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
      'ingreso': 'attach_money',
      'ingreso_bizum': 'currency_exchange',
      'venta': 'sell',
      'reembolso': 'receipt_long',
      'gasto': 'payments'
    };
  }
}
