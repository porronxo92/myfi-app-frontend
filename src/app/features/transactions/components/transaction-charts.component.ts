import { Component, input, signal, computed, effect, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

type ChartViewMode = 'expense' | 'income' | 'both';

interface CategoryData {
  category: Category;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-transaction-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-container">
      <div class="charts-header">
        <h2 class="charts-title">Análisis por Categorías</h2>
        <div class="view-toggle">
          <button 
            class="toggle-btn"
            [class.active]="viewMode() === 'expense'"
            (click)="setViewMode('expense')"
          >
            Gastos
          </button>
          <button 
            class="toggle-btn"
            [class.active]="viewMode() === 'income'"
            (click)="setViewMode('income')"
          >
            Ingresos
          </button>
          <button 
            class="toggle-btn"
            [class.active]="viewMode() === 'both'"
            (click)="setViewMode('both')"
          >
            Ambos
          </button>
        </div>
      </div>

      <div class="charts-content">
        <!-- Gráfico de Gastos -->
        <div class="chart-wrapper" *ngIf="viewMode() === 'expense' || viewMode() === 'both'">
          <h3 class="chart-subtitle">Distribución de Gastos</h3>
          <div class="chart-container">
            <canvas #expenseChart></canvas>
          </div>
          <div class="chart-legend" *ngIf="expenseData().length > 0">
            <div class="legend-item" *ngFor="let item of expenseData()">
              <span class="legend-color" [style.background-color]="item.category.color"></span>
              <span class="legend-label">{{ item.category.name }}</span>
              <span class="legend-value">{{ item.amount | number:'1.2-2' }} € ({{ item.percentage | number:'1.0-0' }}%)</span>
            </div>
          </div>
          <div class="no-data" *ngIf="expenseData().length === 0">
            <p>No hay gastos en el período seleccionado</p>
          </div>
        </div>

        <!-- Gráfico de Ingresos -->
        <div class="chart-wrapper" *ngIf="viewMode() === 'income' || viewMode() === 'both'">
          <h3 class="chart-subtitle">Distribución de Ingresos</h3>
          <div class="chart-container">
            <canvas #incomeChart></canvas>
          </div>
          <div class="chart-legend" *ngIf="incomeData().length > 0">
            <div class="legend-item" *ngFor="let item of incomeData()">
              <span class="legend-color" [style.background-color]="item.category.color"></span>
              <span class="legend-label">{{ item.category.name }}</span>
              <span class="legend-value">{{ item.amount | number:'1.2-2' }} € ({{ item.percentage | number:'1.0-0' }}%)</span>
            </div>
          </div>
          <div class="no-data" *ngIf="incomeData().length === 0">
            <p>No hay ingresos en el período seleccionado</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charts-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }

    .charts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .charts-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
      background: #f8fafc;
      padding: 0.25rem;
      border-radius: 8px;
    }

    .toggle-btn {
      padding: 0.5rem 1rem;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: #64748b;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      color: #475569;
    }

    .toggle-btn.active {
      background: white;
      color: #3b82f6;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .charts-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .chart-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .chart-subtitle {
      font-size: 1.125rem;
      font-weight: 600;
      color: #475569;
      margin: 0;
    }

    .chart-container {
      position: relative;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    canvas {
      max-height: 100%;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      color: #475569;
      font-weight: 500;
    }

    .legend-value {
      color: #64748b;
      font-size: 0.9375rem;
    }

    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #94a3b8;
      font-style: italic;
    }

    @media (max-width: 900px) {
      .charts-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TransactionChartsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('expenseChart') expenseCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('incomeChart') incomeCanvasRef?: ElementRef<HTMLCanvasElement>;

  transactions = input.required<Transaction[]>();
  categories = input.required<Category[]>();

  viewMode = signal<ChartViewMode>('expense');

  private expenseChartInstance?: Chart;
  private incomeChartInstance?: Chart;

  // Datos procesados para los gráficos
  expenseData = computed(() => this.getCategoryData('expense'));
  incomeData = computed(() => this.getCategoryData('income'));

  constructor() {
    // Actualizar gráficos cuando cambien los datos
    effect(() => {
      const expenses = this.expenseData();
      const incomes = this.incomeData();
      
      if (this.expenseChartInstance) {
        this.updateChart(this.expenseChartInstance, expenses);
      }
      
      if (this.incomeChartInstance) {
        this.updateChart(this.incomeChartInstance, incomes);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  ngOnDestroy(): void {
    this.expenseChartInstance?.destroy();
    this.incomeChartInstance?.destroy();
  }

  setViewMode(mode: ChartViewMode): void {
    this.viewMode.set(mode);
    
    // Recrear gráficos si es necesario
    setTimeout(() => this.initCharts(), 0);
  }

  private initCharts(): void {
    if (this.viewMode() === 'expense' || this.viewMode() === 'both') {
      this.initExpenseChart();
    }
    
    if (this.viewMode() === 'income' || this.viewMode() === 'both') {
      this.initIncomeChart();
    }
  }

  private initExpenseChart(): void {
    if (!this.expenseCanvasRef) return;

    this.expenseChartInstance?.destroy();

    const ctx = this.expenseCanvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.expenseData();
    
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category.name),
        datasets: [{
          data: data.map(d => d.amount),
          backgroundColor: data.map(d => d.category.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: any) => a + (b || 0), 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value.toFixed(2)} € (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.expenseChartInstance = new Chart(ctx, config);
  }

  private initIncomeChart(): void {
    if (!this.incomeCanvasRef) return;

    this.incomeChartInstance?.destroy();

    const ctx = this.incomeCanvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.incomeData();
    
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category.name),
        datasets: [{
          data: data.map(d => d.amount),
          backgroundColor: data.map(d => d.category.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: any) => a + (b || 0), 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value.toFixed(2)} € (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.incomeChartInstance = new Chart(ctx, config);
  }

  private updateChart(chart: Chart, data: CategoryData[]): void {
    chart.data.labels = data.map(d => d.category.name);
    chart.data.datasets[0].data = data.map(d => d.amount);
    chart.data.datasets[0].backgroundColor = data.map(d => d.category.color);
    chart.update();
  }

  private getCategoryData(type: 'income' | 'expense'): CategoryData[] {
    const filtered = this.transactions().filter(t => 
      (t.type || t.transaction_type) === type && t.category_id
    );

    const categoryMap = new Map<string, number>();
    
    filtered.forEach(t => {
      const catId = t.category_id!;
      const current = categoryMap.get(catId) || 0;
      categoryMap.set(catId, current + Math.abs(t.amount));
    });

    const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);

    const result: CategoryData[] = [];
    
    categoryMap.forEach((amount, categoryId) => {
      const category = this.categories().find(c => c.id === categoryId);
      if (category) {
        result.push({
          category,
          amount,
          percentage: (amount / total) * 100
        });
      }
    });

    return result.sort((a, b) => b.amount - a.amount);
  }
}
