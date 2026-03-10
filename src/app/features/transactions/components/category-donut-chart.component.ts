/**
 * Category Donut Chart Component
 * ================================
 * 
 * Displays a single interactive donut chart showing category breakdown
 * User can toggle between Income and Expenses view
 * Shows total amount in the center and percentage + amount on hover
 */

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType as ChartJSType } from 'chart.js';

type ChartType = 'income' | 'expense';

interface CategoryData {
  category: string;
  total: number;
  color: string;
}

@Component({
  selector: 'app-category-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card">
      <!-- Header with Toggle -->
      <div class="chart-header">
        <h3 class="chart-title">Distribución por Categorías</h3>
        <div class="chart-toggle">
          <button 
            class="toggle-btn" 
            [class.active]="chartType() === 'expense'"
            (click)="setChartType('expense')">
            Gastos
          </button>
          <button 
            class="toggle-btn" 
            [class.active]="chartType() === 'income'"
            (click)="setChartType('income')">
            Ingresos
          </button>
        </div>
      </div>

      <!-- Chart Canvas -->
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
        <div class="chart-center-text">
          <div class="center-label">Total</div>
          <div class="center-amount" [class.income-color]="chartType() === 'income'" [class.expense-color]="chartType() === 'expense'">
            {{ currentTotal() | number:'1.2-2' }}€
          </div>
        </div>
      </div>

      <!-- No data message -->
      <div class="no-data" *ngIf="!hasData()">
        <p>No hay datos para mostrar en el período seleccionado</p>
      </div>
    </div>
  `,
  styles: [`
    .chart-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: border-color 100ms ease;
    }

    .chart-card:hover {
      border-color: var(--color-slate-500);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
      flex-shrink: 0;
    }

    .chart-title {
      margin: 0;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chart-toggle {
      display: flex;
      gap: 2px;
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      padding: 2px;
    }

    .toggle-btn {
      padding: var(--space-1) var(--space-3);
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 100ms ease;
      white-space: nowrap;
    }

    .toggle-btn:hover {
      color: var(--text-secondary);
    }

    .toggle-btn.active {
      background: var(--color-accent);
      color: var(--color-slate-900);
    }

    .chart-container {
      position: relative;
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    canvas {
      max-width: 100%;
      max-height: 100%;
    }

    .chart-center-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }

    .center-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: var(--space-1);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .center-amount {
      font-family: var(--font-data);
      font-size: 1rem;
      font-weight: 600;
      line-height: 1;
    }

    .income-color {
      color: var(--color-positive);
    }

    .expense-color {
      color: var(--color-negative);
    }

    .no-data {
      text-align: center;
      padding: var(--space-3);
      color: var(--text-muted);
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-data p {
      margin: 0;
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }

      .center-amount {
        font-size: 0.875rem;
      }
    }
  `]
})
export class CategoryDonutChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() incomeData: CategoryData[] = [];
  @Input() expenseData: CategoryData[] = [];
  
  chartType = signal<ChartType>('expense');
  currentTotal = signal<number>(0);
  hasData = signal<boolean>(false);
  
  private chart: Chart | null = null;

  ngOnInit(): void {
    // Chart initialized
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incomeData'] || changes['expenseData']) {
      // Si el chart ya existe, actualizar
      if (this.chart) {
        this.updateChart();
      }
      // Si es el primer cambio pero ya tenemos el canvas, crear el chart
      else if (this.chartCanvas) {
        this.createChart();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  setChartType(type: ChartType): void {
    this.chartType.set(type);
    this.updateChart();
  }

  private createChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    const chartData = this.prepareChartData();
    const config = this.getChartConfig(chartData);
    this.chart = new Chart(ctx, config);
  }

  private prepareChartData(): any {
    const data = this.chartType() === 'income' ? this.incomeData : this.expenseData;
    
    if (!data || data.length === 0) {
      this.hasData.set(false);
      this.currentTotal.set(0);
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0
        }]
      };
    }

    this.hasData.set(true);
    const total = data.reduce((sum, cat) => sum + cat.total, 0);
    this.currentTotal.set(total);

    const labels = data.map(cat => cat.category);
    const values = data.map(cat => cat.total);
    const colors = data.map(cat => cat.color);

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff'
      }]
    };
  }

  private getChartConfig(chartData: any): any {
    return {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 6,
              font: {
                size: 10
              },
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#6b7280',
              boxWidth: 6,
              boxHeight: 6
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value.toFixed(2)}€ (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  }

  private updateChart(): void {
    if (!this.chart) {
      return;
    }

    const chartData = this.prepareChartData();
    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets = chartData.datasets;
    this.chart.update('active');
  }
}
