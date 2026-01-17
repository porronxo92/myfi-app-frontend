/**
 * Category Pie Chart Component
 * =============================
 * 
 * Displays income and expenses by category as doughnut charts using Chart.js
 * Shows two separate charts: one for income (green tones) and one for expenses (red tones)
 */

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { ChartWrapperService } from '../../../shared/services/chart-wrapper.service';

@Component({
  selector: 'app-category-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-container">
      <!-- Income Chart -->
      <div class="chart-section">
        <h4 class="chart-title income-title">💰 Ingresos</h4>
        <div class="chart-wrapper">
          <canvas #incomeCanvas></canvas>
        </div>
        <div class="chart-total" *ngIf="data?.income?.total">
          <span class="total-label">Total:</span>
          <span class="total-amount income-amount">{{ data.income.total | number:'1.2-2' }}€</span>
        </div>
      </div>

      <!-- Expenses Chart -->
      <div class="chart-section">
        <h4 class="chart-title expense-title">💸 Gastos</h4>
        <div class="chart-wrapper">
          <canvas #expenseCanvas></canvas>
        </div>
        <div class="chart-total" *ngIf="data?.expenses?.total">
          <span class="total-label">Total:</span>
          <span class="total-amount expense-amount">{{ data.expenses.total | number:'1.2-2' }}€</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charts-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      width: 100%;
    }

    .chart-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .chart-title {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .income-title {
      color: #10b981;
    }

    .expense-title {
      color: #ef4444;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
      max-width: 300px;
    }

    canvas {
      max-height: 300px !important;
    }

    .chart-total {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
      font-size: 1.1rem;
    }

    .total-label {
      font-weight: 500;
      color: #6b7280;
    }

    .total-amount {
      font-weight: 700;
      font-size: 1.3rem;
    }

    .income-amount {
      color: #10b981;
    }

    .expense-amount {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .charts-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoryPieChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('incomeCanvas', { static: false }) incomeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expenseCanvas', { static: false }) expenseCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() data: any = null;
  
  private incomeChart: Chart | null = null;
  private expenseChart: Chart | null = null;

  constructor(private chartService: ChartWrapperService) {}

  ngOnInit(): void {
    console.log('📊 CategoryPieChart initialized with data:', this.data);
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      console.log('📊 CategoryPieChart data changed, updating charts');
      this.updateCharts();
    }
  }

  ngOnDestroy(): void {
    this.chartService.destroyChart(this.incomeChart);
    this.chartService.destroyChart(this.expenseChart);
  }

  private createCharts(): void {
    this.createIncomeChart();
    this.createExpenseChart();
  }

  private createIncomeChart(): void {
    if (!this.incomeCanvas) {
      console.warn('Income chart canvas not available yet');
      return;
    }

    const ctx = this.incomeCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Cannot get 2D context from income canvas');
      return;
    }

    const chartData = this.prepareIncomeChartData();
    const config = this.chartService.getDoughnutChartConfig(chartData, 'Ingresos por Categoría');
    this.incomeChart = new Chart(ctx, config);
  }

  private createExpenseChart(): void {
    if (!this.expenseCanvas) {
      console.warn('Expense chart canvas not available yet');
      return;
    }

    const ctx = this.expenseCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Cannot get 2D context from expense canvas');
      return;
    }

    const chartData = this.prepareExpenseChartData();
    const config = this.chartService.getDoughnutChartConfig(chartData, 'Gastos por Categoría');
    this.expenseChart = new Chart(ctx, config);
  }

  private prepareIncomeChartData(): any {
    if (!this.data?.income?.categories || this.data.income.categories.length === 0) {
      return {
        labels: ['Sin ingresos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0
        }]
      };
    }

    const labels = this.data.income.categories.map((cat: any) => cat.category);
    const values = this.data.income.categories.map((cat: any) => cat.total);
    const colors = this.data.income.categories.map((cat: any) => cat.color || '#10b981');

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  private prepareExpenseChartData(): any {
    if (!this.data?.expenses?.categories || this.data.expenses.categories.length === 0) {
      return {
        labels: ['Sin gastos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0
        }]
      };
    }

    const labels = this.data.expenses.categories.map((cat: any) => cat.category);
    const values = this.data.expenses.categories.map((cat: any) => cat.total);
    const colors = this.data.expenses.categories.map((cat: any) => cat.color || '#ef4444');

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  private updateCharts(): void {
    if (this.incomeChart) {
      const incomeData = this.prepareIncomeChartData();
      this.incomeChart.data.labels = incomeData.labels;
      this.incomeChart.data.datasets = incomeData.datasets;
      this.incomeChart.update();
    }

    if (this.expenseChart) {
      const expenseData = this.prepareExpenseChartData();
      this.expenseChart.data.labels = expenseData.labels;
      this.expenseChart.data.datasets = expenseData.datasets;
      this.expenseChart.update();
    }
  }
}
