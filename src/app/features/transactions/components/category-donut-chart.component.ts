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
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chart-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      flex-shrink: 0;
    }

    .chart-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }

    .chart-toggle {
      display: flex;
      gap: 0.25rem;
      background: #f3f4f6;
      border-radius: 6px;
      padding: 2px;
    }

    .toggle-btn {
      padding: 0.25rem 0.625rem;
      border: none;
      background: transparent;
      border-radius: 4px;
      font-size: 0.6875rem;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .toggle-btn:hover {
      color: #111827;
    }

    .toggle-btn.active {
      background: white;
      color: #111827;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 0.125rem;
    }

    .center-amount {
      font-size: 1.125rem;
      font-weight: 700;
      line-height: 1;
    }

    .income-color {
      color: #10b981;
    }

    .expense-color {
      color: #ef4444;
    }

    .no-data {
      text-align: center;
      padding: 0.5rem;
      color: #6b7280;
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
        gap: 0.5rem;
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
    console.log('📊 CategoryDonutChart initialized');
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incomeData'] || changes['expenseData']) {
      console.log('📈 Data changed - incomeData:', this.incomeData?.length, 'expenseData:', this.expenseData?.length);
      
      // Si el chart ya existe, actualizar
      if (this.chart) {
        console.log('🔄 Updating existing chart');
        this.updateChart();
      }
      // Si es el primer cambio pero ya tenemos el canvas, crear el chart
      else if (this.chartCanvas) {
        console.log('🎉 Creating chart with initial data');
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
      console.warn('Chart canvas not available yet');
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Cannot get 2D context from canvas');
      return;
    }

    const chartData = this.prepareChartData();
    const config = this.getChartConfig(chartData);
    this.chart = new Chart(ctx, config);
  }

  private prepareChartData(): any {
    const data = this.chartType() === 'income' ? this.incomeData : this.expenseData;
    
    console.log(`📄 Preparing chart data for ${this.chartType()}:`, data);
    
    if (!data || data.length === 0) {
      console.log('⚠️ No data available');
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

    console.log('✅ Chart data prepared - labels:', labels, 'values:', values, 'total:', total);

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
