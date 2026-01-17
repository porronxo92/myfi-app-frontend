/**
 * Top Spending Chart Component
 * =============================
 * 
 * Displays top merchants/categories by spending as a horizontal bar chart
 */

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { ChartWrapperService } from '../../../shared/services/chart-wrapper.service';

@Component({
  selector: 'app-top-spending-chart',
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
export class TopSpendingChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() data: any = null;
  @Input() type: 'merchants' | 'categories' = 'merchants';
  
  private chart: Chart | null = null;

  constructor(private chartService: ChartWrapperService) {}

  ngOnInit(): void {
    console.log('📊 TopSpendingChart initialized with data:', this.data);
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chartService.destroyChart(this.chart);
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

    // Prepare data
    const chartData = this.prepareChartData();

    // Get configuration
    const config = this.chartService.getBarChartConfig(chartData, '', true); // horizontal = true

    // Create chart
    this.chart = new Chart(ctx, config);
  }

  private prepareChartData(): any {
    if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Gasto',
          data: [0],
          backgroundColor: ['#e5e7eb']
        }]
      };
    }

    const labels: string[] = [];
    const values: number[] = [];
    const colors = this.chartService.getColorPalette();

    // Take top 10 items
    const topItems = this.data.slice(0, 10);

    topItems.forEach((item: any, index: number) => {
      if (this.type === 'merchants') {
        labels.push(item.merchant || item.description || `Item ${index + 1}`);
      } else {
        labels.push(item.category_name || item.name || `Categoría ${index + 1}`);
      }
      values.push(Math.abs(item.total || item.amount || 0));
    });

    return {
      labels,
      datasets: [{
        label: 'Gasto Total',
        data: values,
        backgroundColor: colors
      }]
    };
  }

  /**
   * Update chart with new data
   */
  updateChart(newData: any): void {
    if (!this.chart) return;

    const chartData = this.prepareChartData();
    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets[0].data = chartData.datasets[0].data;
    this.chart.data.datasets[0].backgroundColor = chartData.datasets[0].backgroundColor;
    this.chart.update();
  }
}
