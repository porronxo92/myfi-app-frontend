/**
 * Health Card Component
 * ====================
 * 
 * Componente que muestra el análisis de salud financiera generado por IA.
 */

import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthService, HealthReport } from '../../../core/services/health.service';

@Component({
  selector: 'app-health-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-card.component.html',
  styleUrls: ['./health-card.component.scss']
})
export class HealthCardComponent implements OnInit, OnChanges {
  @Input() year!: number;
  @Input() accountId: string | null = null; // Recibido pero NO usado para recargar

  healthReport = signal<HealthReport | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  reportRequested = signal(false); // Indica si el usuario ha solicitado el reporte
  
  // Almacenar el año anterior para detectar cambios reales
  private previousYear: number | undefined;

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.previousYear = this.year;
    // Ya NO se carga automáticamente el reporte
    // this.loadHealthReport();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando cambie el año, resetear el estado del reporte
    if (changes['year']) {
      const newYear = changes['year'].currentValue;
      const oldYear = changes['year'].previousValue;
      
      // Verificar que el año haya cambiado realmente y no sea la primera carga
      if (!changes['year'].firstChange && newYear !== oldYear && newYear !== this.previousYear) {
        this.previousYear = newYear;
        // Resetear el estado para que el usuario deba solicitar el nuevo reporte
        this.reportRequested.set(false);
        this.healthReport.set(null);
        this.error.set(null);
        return;
      }
    }
    
    // NOTA: accountId ya NO dispara recarga del reporte
    // El análisis de salud financiera es global del año, no filtrado por cuenta
  }

  requestHealthReport(): void {
    if (!this.year) {
      return;
    }

    this.reportRequested.set(true);
    this.loadHealthReport();
  }

  loadHealthReport(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // NOTA: Siempre se pasa null como accountId para obtener análisis global de todas las cuentas
    this.healthService.generateHealthReport(this.year, null).subscribe({
      next: (report) => {
        this.healthReport.set(report);
        this.isLoading.set(false);
      },
      error: () => {
        console.error('Error loading health report');
        this.error.set('No se pudo generar el informe de salud financiera');
        this.isLoading.set(false);
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // Verde
    if (score >= 60) return '#3b82f6'; // Azul
    if (score >= 40) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Buena';
    if (score >= 40) return 'Mejorable';
    return 'Crítica';
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || 'ℹ️';
  }

  getStrokeDashoffset(score: number): number {
    const circumference = 2 * Math.PI * 45; // radio = 45
    return circumference - (circumference * score / 100);
  }
}
