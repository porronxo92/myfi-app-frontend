import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCalculationsService } from '../services/dashboard-calculations.service';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-grid">
      <!-- Balance Total -->
      <div class="summary-card balance">
        <div class="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Balance Total</p>
          <h3 class="card-value">{{ summary().totalBalance | currency:'EUR':'symbol':'1.2-2' }}</h3>
          <div class="card-variation" [class.positive]="summary().balanceVariation >= 0" [class.negative]="summary().balanceVariation < 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="summary().balanceVariation >= 0">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="summary().balanceVariation < 0">
              <path d="M17 7L7 17M7 17H17M7 17V7"/>
            </svg>
            <span>{{ summary().balanceVariation | number:'1.1-1' }}% vs mes anterior</span>
          </div>
        </div>
      </div>

      <!-- Ingresos del Mes -->
      <div class="summary-card income">
        <div class="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Ingresos del Mes</p>
          <h3 class="card-value positive">{{ summary().monthlyIncome | currency:'EUR':'symbol':'1.2-2' }}</h3>
          <div class="card-variation" [class.positive]="summary().incomeVariation >= 0" [class.negative]="summary().incomeVariation < 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="summary().incomeVariation >= 0">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="summary().incomeVariation < 0">
              <path d="M17 7L7 17M7 17H17M7 17V7"/>
            </svg>
            <span>{{ summary().incomeVariation | number:'1.1-1' }}% vs mes anterior</span>
          </div>
        </div>
      </div>

      <!-- Gastos del Mes -->
      <div class="summary-card expense">
        <div class="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 7L7 17M7 17H17M7 17V7"/>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Gastos del Mes</p>
          <h3 class="card-value negative">{{ summary().monthlyExpenses | currency:'EUR':'symbol':'1.2-2' }}</h3>
          <div class="card-variation" [class.positive]="summary().expenseVariation <= 0" [class.negative]="summary().expenseVariation > 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="summary().expenseVariation <= 0">
              <path d="M17 7L7 17M7 17H17M7 17V7"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="summary().expenseVariation > 0">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
            <span>{{ Math.abs(summary().expenseVariation) | number:'1.1-1' }}% vs mes anterior</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
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
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .summary-card.balance .card-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
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
      min-width: 0;
    }

    .card-label {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }

    .card-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }

    .card-value.positive {
      color: #059669;
    }

    .card-value.negative {
      color: #dc2626;
    }

    .card-variation {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .card-variation.positive {
      color: #16a34a;
    }

    .card-variation.negative {
      color: #dc2626;
    }

    .card-variation svg {
      flex-shrink: 0;
    }

    @media (max-width: 1024px) {
      .summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }

      .card-value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardSummaryComponent {
  private calculationsService = inject(DashboardCalculationsService);
  
  summary = this.calculationsService.getSummary;
  Math = Math;
}
