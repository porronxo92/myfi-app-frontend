import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpis-container">
      <!-- Balance Total -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Balance Total</span>
          <div class="kpi-icon balance">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="kpi-value" [class.positive]="balance() > 0" [class.negative]="balance() < 0">
          {{ balance() | number:'1.2-2' }} €
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend" [class.up]="balanceVariation() > 0" [class.down]="balanceVariation() < 0">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" *ngIf="balanceVariation() > 0">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" *ngIf="balanceVariation() < 0">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
            </svg>
            {{ balanceVariation() > 0 ? '+' : '' }}{{ balanceVariation() | number:'1.1-1' }}%
          </span>
          <span class="kpi-period">vs. mes anterior</span>
        </div>
      </div>

      <!-- Ingresos del Mes -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Ingresos (Mes)</span>
          <div class="kpi-icon income">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
            </svg>
          </div>
        </div>
        <div class="kpi-value positive">
          +{{ monthlyIncome() | number:'1.2-2' }} €
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend up">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            Positivo
          </span>
        </div>
      </div>

      <!-- Gastos del Mes -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Gastos (Mes)</span>
          <div class="kpi-icon expense">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
            </svg>
          </div>
        </div>
        <div class="kpi-value negative">
          -{{ monthlyExpenses() | number:'1.2-2' }} €
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend down">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
            </svg>
            Negativo
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpis-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
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

    .kpi-icon.balance {
      background-color: #eff6ff;
      color: #3b82f6;
    }

    .kpi-icon.income {
      background-color: #f0fdf4;
      color: #10b981;
    }

    .kpi-icon.expense {
      background-color: #fef2f2;
      color: #ef4444;
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

    .kpi-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .kpi-trend.up {
      color: #10b981;
    }

    .kpi-trend.down {
      color: #ef4444;
    }

    .kpi-period {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .kpis-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TransactionKpisComponent {
  balance = input.required<number>();
  monthlyIncome = input.required<number>();
  monthlyExpenses = input.required<number>();
  balanceVariation = input.required<number>();
}
