import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-summary-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-cards">
      <!-- Ingresos del mes -->
      <div class="summary-card income">
        <div class="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Ingresos del Mes</p>
          <h3 class="card-value">{{ monthlyIncome | currency:'EUR':'symbol':'1.2-2' }}</h3>
          <div class="card-variation" [class.positive]="incomeVariation >= 0" [class.negative]="incomeVariation < 0">
            <span>{{ incomeVariation | number:'1.1-1' }}%</span>
          </div>
        </div>
      </div>

      <!-- Gastos del mes -->
      <div class="summary-card expense">
        <div class="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 7L7 17M7 17H17M7 17V7"/>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Gastos del Mes</p>
          <h3 class="card-value">{{ monthlyExpenses | currency:'EUR':'symbol':'1.2-2' }}</h3>
          <div class="card-variation" [class.positive]="expenseVariation <= 0" [class.negative]="expenseVariation > 0">
            <span>{{ Math.abs(expenseVariation) | number:'1.1-1' }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-cards {
      display: grid;
      gap: var(--space-4);
      margin-bottom: var(--space-5);
    }

    .summary-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      padding: var(--space-5);
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      transition: border-color 100ms ease;
    }

    .summary-card:hover {
      border-color: var(--color-slate-500);
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .summary-card.income .card-icon {
      background: rgba(34, 160, 107, 0.15);
      color: var(--color-positive);
    }

    .summary-card.expense .card-icon {
      background: rgba(202, 53, 33, 0.15);
      color: var(--color-negative);
    }

    .card-content {
      flex: 1;
    }

    .card-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      margin: 0 0 var(--space-2) 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .card-value {
      font-family: var(--font-data);
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 var(--space-2) 0;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .summary-card.income .card-value {
      color: var(--color-positive);
    }

    .summary-card.expense .card-value {
      color: var(--color-negative);
    }

    .card-variation {
      font-family: var(--font-data);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .card-variation.positive {
      color: var(--color-positive);
    }

    .card-variation.negative {
      color: var(--color-negative);
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountSummaryCardsComponent {
  @Input() monthlyIncome: number = 0;
  @Input() monthlyExpenses: number = 0;
  @Input() incomeVariation: number = 0;
  @Input() expenseVariation: number = 0;

  Math = Math;
}
