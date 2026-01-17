/**
 * Charts Section Component
 * =========================
 * 
 * Componente que muestra la sección de análisis visual con gráficos.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryPieChartComponent } from './category-pie-chart.component';
import { MonthlyTrendChartComponent } from './monthly-trend-chart.component';

@Component({
  selector: 'app-charts-section',
  standalone: true,
  imports: [
    CommonModule,
    CategoryPieChartComponent,
    MonthlyTrendChartComponent
  ],
  templateUrl: './charts-section.component.html',
  styleUrls: ['./charts-section.component.scss']
})
export class ChartsSectionComponent {
  @Input() monthlyCategoryBreakdown: any;
  @Input() yearlyMonthlyTrend: any[] = [];
  @Input() monthName: string = '';
  @Input() year: number = new Date().getFullYear();
}
