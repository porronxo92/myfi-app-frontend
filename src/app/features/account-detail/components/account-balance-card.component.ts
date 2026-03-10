import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrendPoint {
  date: string;
  balance: number;
}

@Component({
  selector: 'app-account-balance-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="balance-card">
      <div class="balance-header">
        <div>
          <p class="balance-label">Saldo Disponible</p>
          <h2 class="balance-amount">{{ currentBalance | currency:'EUR':'symbol':'1.2-2' }}</h2>
          <div class="balance-variation" [class.positive]="variation >= 0" [class.negative]="variation < 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="variation >= 0">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="variation < 0">
              <path d="M17 7L7 17M7 17H17M7 17V7"/>
            </svg>
            <span>{{ variation | number:'1.1-1' }}% vs mes pasado</span>
          </div>
        </div>
      </div>

      <!-- Mini gráfico de tendencia -->
      <div class="balance-chart">
        <svg class="chart-svg" viewBox="0 0 400 80" preserveAspectRatio="none">
          <!-- Área sombreada -->
          <path [attr.d]="areaPath()" class="chart-area" fill="url(#miniGradient)" />
          
          <!-- Línea -->
          <path [attr.d]="linePath()" class="chart-line" fill="none" />

          <!-- Gradient -->
          <defs>
            <linearGradient id="miniGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#B5924C;stop-opacity:0.2" />
              <stop offset="100%" style="stop-color:#B5924C;stop-opacity:0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .balance-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      border-left: 3px solid var(--color-accent);
      padding: var(--space-6);
      color: var(--text-primary);
      position: relative;
      overflow: hidden;
    }

    .balance-header {
      position: relative;
      z-index: 1;
      margin-bottom: var(--space-5);
    }

    .balance-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      margin: 0 0 var(--space-2) 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .balance-amount {
      font-family: var(--font-data);
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 var(--space-3) 0;
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--color-accent);
    }

    .balance-variation {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      background: var(--bg-elevated);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      font-family: var(--font-data);
    }

    .balance-variation.positive {
      color: var(--color-positive);
    }

    .balance-variation.negative {
      color: var(--color-negative);
    }

    .balance-variation svg {
      flex-shrink: 0;
    }

    .balance-chart {
      height: 80px;
      margin-top: var(--space-4);
      opacity: 0.6;
    }

    .chart-svg {
      width: 100%;
      height: 100%;
    }

    .chart-line {
      stroke: var(--color-accent);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-width: 768px) {
      .balance-card {
        padding: var(--space-4);
      }

      .balance-amount {
        font-size: 1.5rem;
      }
    }
  `]
})
export class AccountBalanceCardComponent {
  @Input() currentBalance: number = 0;
  @Input() variation: number = 0;
  @Input() trendData: TrendPoint[] = [];

  /**
   * Calcula los puntos del gráfico normalizados
   */
  chartPoints(): { x: number; y: number }[] {
    if (this.trendData.length === 0) return [];

    const values = this.trendData.map(d => d.balance);
    const min = Math.min(...values, 0);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 400;
    const height = 80;
    const padding = 5;

    return this.trendData.map((d, i) => ({
      x: (i / (this.trendData.length - 1)) * width,
      y: height - padding - ((d.balance - min) / range) * (height - padding * 2)
    }));
  }

  /**
   * Genera el path SVG para la línea
   */
  linePath(): string {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    return points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');
  }

  /**
   * Genera el path SVG para el área
   */
  areaPath(): string {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    const line = this.linePath();
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];

    return `${line} L ${lastPoint.x} 80 L ${firstPoint.x} 80 Z`;
  }
}
