import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpis-container">
      <!-- Total Transacciones -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Total Movimientos</span>
          <div class="kpi-icon count">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
        </div>
        <div class="kpi-value">
          {{ totalTransactions() }}
        </div>
      </div>

      <!-- Balance Total Compacto -->
      <div class="kpi-card balance-card">
        <div class="kpi-header">
          <span class="kpi-label">Balance {{ balanceLabel() }}</span>
          <div class="kpi-icon balance">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="kpi-value" [class.positive]="balance() > 0" [class.negative]="balance() < 0">
          {{ balance() | number:'1.2-2' }} €
        </div>
        
        <!-- Detalle compacto -->
        <div class="balance-details">
          <div class="balance-item income">
            <span class="label">Ingresos</span>
            <span class="value">+{{ monthlyIncome() | number:'1.2-2' }}€</span>
          </div>
          <div class="balance-item expense">
            <span class="label">Gastos</span>
            <span class="value">-{{ monthlyExpenses() | number:'1.2-2' }}€</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpis-container {
      display: contents;
    }

    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      margin-bottom: 1rem;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }

    .kpi-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon.count {
      background-color: #f0f9ff;
      color: #0ea5e9;
    }

    .kpi-icon.balance {
      background-color: #eff6ff;
      color: #3b82f6;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.75rem;
    }

    .kpi-value.positive {
      color: #10b981;
    }

    .kpi-value.negative {
      color: #ef4444;
    }

    .balance-details {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.75rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .balance-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .balance-item .label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

    .balance-item .value {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .balance-item.income .value {
      color: #10b981;
    }

    .balance-item.expense .value {
      color: #ef4444;
    }

    .kpi-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
    }

    .kpi-trend.up {
      color: #10b981;
    }

    .kpi-trend.down {
      color: #ef4444;
    }

    .kpi-trend.neutral {
      color: #64748b;
    }

    .kpi-period {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .kpis-container {
        grid-template-columns: 1fr;
      }
      
      .kpi-value {
        font-size: 1.75rem;
      }
      
      .balance-details {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class TransactionKpisComponent {
  totalTransactions = input.required<number>();
  balance = input.required<number>();
  monthlyIncome = input.required<number>();
  monthlyExpenses = input.required<number>();
  balanceVariation = input.required<number>();
  
  // Inputs opcionales para el periodo filtrado
  selectedMonth = input<number | undefined>(undefined);
  selectedYear = input<number | undefined>(undefined);

  // Computed property para obtener el label del balance
  balanceLabel = computed(() => {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const now = new Date();
    const month = this.selectedMonth() !== undefined ? this.selectedMonth()! : (now.getMonth() + 1);
    const year = this.selectedYear() !== undefined ? this.selectedYear()! : now.getFullYear();
    
    const monthName = monthNames[month - 1]; // month es 1-12, array es 0-11
    
    return `${monthName} ${year}`;
  });
}
