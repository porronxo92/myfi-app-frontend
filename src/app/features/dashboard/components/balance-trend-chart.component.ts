import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCalculationsService } from '../services/dashboard-calculations.service';

@Component({
  selector: 'app-balance-trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h2 class="chart-title">Tendencia de Balance</h2>
        <div class="chart-controls">
          <button 
            class="btn-range" 
            [class.active]="selectedRange() === '6m'"
            (click)="selectedRange.set('6m')"
          >
            6 meses
          </button>
          <button 
            class="btn-range" 
            [class.active]="selectedRange() === '1y'"
            (click)="selectedRange.set('1y')"
          >
            1 año
          </button>
        </div>
      </div>

      <div class="chart-body">
        <!-- SVG Line Chart -->
        <svg class="chart-svg" viewBox="0 0 800 300" preserveAspectRatio="none">
          <!-- Grid lines -->
          <line 
            *ngFor="let i of [0, 1, 2, 3, 4]" 
            [attr.x1]="0" 
            [attr.y1]="i * 60" 
            [attr.x2]="800" 
            [attr.y2]="i * 60" 
            class="grid-line"
          />

          <!-- Area fill -->
          <path 
            [attr.d]="areaPath()" 
            class="chart-area"
            fill="url(#gradient)"
          />

          <!-- Line -->
          <path 
            [attr.d]="linePath()" 
            class="chart-line"
            fill="none"
          />

          <!-- Points -->
          <circle
            *ngFor="let point of chartPoints(); let i = index"
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            r="5"
            class="chart-point"
            (mouseenter)="hoveredIndex.set(i)"
            (mouseleave)="hoveredIndex.set(null)"
          />

          <!-- Gradient definition -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#667eea;stop-opacity:0" />
            </linearGradient>
          </defs>
        </svg>

        <!-- X-axis labels -->
        <div class="chart-labels">
          <span 
            *ngFor="let data of balanceTrend(); let i = index" 
            class="label"
            [style.left.%]="(i / (balanceTrend().length - 1)) * 100"
          >
            {{ data.month }}
          </span>
        </div>

        <!-- Tooltip -->
        <div 
          class="chart-tooltip" 
          *ngIf="hoveredIndex() !== null"
          [style.left.%]="(hoveredIndex()! / (balanceTrend().length - 1)) * 100"
        >
          <div class="tooltip-content">
            <p class="tooltip-label">{{ balanceTrend()[hoveredIndex()!].month }}</p>
            <p class="tooltip-value">{{ balanceTrend()[hoveredIndex()!].balance | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .chart-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .chart-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-range {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-range:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .btn-range.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .chart-body {
      position: relative;
      height: 300px;
    }

    .chart-svg {
      width: 100%;
      height: 280px;
    }

    .grid-line {
      stroke: #f1f5f9;
      stroke-width: 1;
    }

    .chart-area {
      opacity: 0.5;
    }

    .chart-line {
      stroke: #667eea;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chart-point {
      fill: #667eea;
      stroke: white;
      stroke-width: 3;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chart-point:hover {
      r: 7;
      fill: #764ba2;
    }

    .chart-labels {
      position: relative;
      height: 20px;
      margin-top: 0.5rem;
    }

    .label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: #64748b;
      white-space: nowrap;
    }

    .chart-tooltip {
      position: absolute;
      top: -60px;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 10;
    }

    .tooltip-content {
      background: #0f172a;
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .tooltip-label {
      font-size: 0.75rem;
      opacity: 0.8;
      margin: 0 0 0.25rem 0;
    }

    .tooltip-value {
      font-size: 0.875rem;
      font-weight: 700;
      margin: 0;
    }

    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .chart-body {
        height: 250px;
      }

      .chart-svg {
        height: 230px;
      }
    }
  `]
})
export class BalanceTrendChartComponent {
  private calculationsService = inject(DashboardCalculationsService);
  
  balanceTrend = this.calculationsService.balanceTrend;
  selectedRange = signal<'6m' | '1y'>('6m');
  hoveredIndex = signal<number | null>(null);

  /**
   * Calcula los puntos del gráfico normalizados al SVG
   */
  chartPoints = () => {
    const data = this.balanceTrend();
    if (data.length === 0) return [];

    const values = data.map(d => d.balance);
    const min = Math.min(...values, 0);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 800;
    const height = 240;
    const padding = 30;

    return data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: height - padding - ((d.balance - min) / range) * (height - padding * 2)
    }));
  };

  /**
   * Genera el path SVG para la línea
   */
  linePath = () => {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    return points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');
  };

  /**
   * Genera el path SVG para el área sombreada
   */
  areaPath = () => {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    const line = this.linePath();
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];

    return `${line} L ${lastPoint.x} 270 L ${firstPoint.x} 270 Z`;
  };
}
