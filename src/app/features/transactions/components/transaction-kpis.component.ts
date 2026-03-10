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
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
      transition: border-color 100ms ease;
    }

    .kpi-card:hover {
      border-color: var(--color-slate-500);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }

    .kpi-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .kpi-icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon.count {
      background: var(--color-accent-subtle);
      color: var(--color-accent);
    }

    .kpi-icon.balance {
      background: var(--color-accent-subtle);
      color: var(--color-accent);
    }

    .kpi-value {
      font-family: var(--font-data);
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-3);
      letter-spacing: -0.02em;
    }

    .kpi-value.positive {
      color: var(--color-positive);
    }

    .kpi-value.negative {
      color: var(--color-negative);
    }

    .balance-details {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
      padding: var(--space-3);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
    }

    .balance-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .balance-item .label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .balance-item .value {
      font-family: var(--font-data);
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .balance-item.income .value {
      color: var(--color-positive);
    }

    .balance-item.expense .value {
      color: var(--color-negative);
    }

    .kpi-footer {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.8125rem;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-family: var(--font-data);
      font-weight: 600;
      font-size: 0.75rem;
    }

    .kpi-trend.up { color: var(--color-positive); }
    .kpi-trend.down { color: var(--color-negative); }
    .kpi-trend.neutral { color: var(--text-muted); }

    .kpi-period {
      color: var(--text-muted);
      font-size: 0.6875rem;
    }

    @media (max-width: 768px) {
      .kpis-container { grid-template-columns: 1fr; }
      .kpi-value { font-size: 1.25rem; }
      .balance-details { flex-direction: column; gap: var(--space-2); }
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
