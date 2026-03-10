/**
 * Monthly Trend Chart Component
 * ==============================
 * 
 * Displays income vs expenses trend over time as a line chart
 * Shows 12 months of data for the selected year
 */

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { ChartWrapperService } from '../../../shared/services/chart-wrapper.service';

@Component({
  selector: 'app-monthly-trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrapper">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      position: relative;
      height: 350px;
      width: 100%;
    }

    canvas {
      max-height: 350px !important;
    }
  `]
})
export class MonthlyTrendChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: false}) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() data: any = null;
  
  private chart: Chart | null = null;

  constructor(private chartService: ChartWrapperService) {}

  ngOnInit(): void {
    // Chart initialized
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart(this.data);
    }
  }

  ngOnDestroy(): void {
    this.chartService.destroyChart(this.chart);
  }

  private createChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Prepare data
    const chartData = this.prepareChartData();

    // Get configuration
    const config = this.chartService.getLineChartConfig(chartData, '');

    // Create chart
    this.chart = new Chart(ctx, config);
  }

  private prepareChartData(): any {
    // Si no hay datos, devolver estructura vacía
    if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
      return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          {
            label: 'Ingresos',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
          },
          {
            label: 'Gastos',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true
          }
        ]
      };
    }

    // Extraer labels (nombres de meses) y datos
    const labels = this.data.map((item: any) => {
      // Usar month_name si existe, sino generar desde el número
      if (item.month_name) return item.month_name.substring(0, 3);
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthNames[item.month - 1] || '';
    });
    const incomeData = this.data.map((item: any) => item.income || 0);
    const expenseData = this.data.map((item: any) => item.expenses || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Gastos',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    };
  }

  /**
   * Update chart with new data
   */
  updateChart(newData: any): void {
    if (!this.chart) {
      this.createChart();
      return;
    }

    this.data = newData;
    const chartData = this.prepareChartData();
    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets = chartData.datasets;
    this.chart.update('none'); // Update without animation for better performance
  }
}
