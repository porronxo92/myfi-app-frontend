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
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .summary-card.income .card-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .summary-card.expense .card-icon {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .card-content {
      flex: 1;
    }

    .card-label {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      line-height: 1;
    }

    .summary-card.income .card-value {
      color: #059669;
    }

    .summary-card.expense .card-value {
      color: #dc2626;
    }

    .card-variation {
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .card-variation.positive {
      color: #16a34a;
    }

    .card-variation.negative {
      color: #dc2626;
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
