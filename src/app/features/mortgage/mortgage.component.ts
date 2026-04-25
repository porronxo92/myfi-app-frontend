import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { MortgageService } from '../../core/services/mortgage.service';
import {
  FinancialProfile,
  MortgageCapacityResult,
  MortgageScenario,
  TargetPriceResult,
  HealthStatus,
  RiskLevel
} from '../../core/models/mortgage.model';

@Component({
  selector: 'app-mortgage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './mortgage.component.html',
  styleUrl: './mortgage.component.scss'
})
export class MortgageComponent implements OnInit {
  private mortgageService = inject(MortgageService);
  private fb = inject(FormBuilder);

  // State signals
  financialProfile = signal<FinancialProfile | null>(null);
  mortgageResult = signal<MortgageCapacityResult | null>(null);
  targetAnalysis = signal<TargetPriceResult | null>(null);
  selectedScenario = signal<'conservative' | 'balanced' | 'aggressive'>('balanced');

  // Loading states
  loadingProfile = signal(false);
  loadingCapacity = signal(false);
  loadingTarget = signal(false);

  // Error states
  errorProfile = signal<string | null>(null);
  errorCapacity = signal<string | null>(null);
  errorTarget = signal<string | null>(null);

  // Forms
  configForm: FormGroup;
  targetForm: FormGroup;

  // Computed
  hasInsufficientData = computed(() => {
    const result = this.mortgageResult();
    return result && result.metadata.months_analyzed === 0;
  });

  currentScenario = computed(() => {
    const result = this.mortgageResult();
    const scenario = this.selectedScenario();
    return result?.scenarios[scenario] || null;
  });

  constructor() {
    // Form para configuracion de hipoteca
    this.configForm = this.fb.group({
      interest_rate: [3.0, [Validators.required, Validators.min(0), Validators.max(20)]],
      years: [30, [Validators.required, Validators.min(5), Validators.max(40)]],
      down_payment_ratio: [20, [Validators.required, Validators.min(0), Validators.max(50)]]
    });

    // Form para analizar precio objetivo
    this.targetForm = this.fb.group({
      target_price: [200000, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadFinancialProfile();
    this.loadMortgageCapacity();
  }

  /**
   * Cargar perfil financiero
   */
  loadFinancialProfile(): void {
    this.loadingProfile.set(true);
    this.errorProfile.set(null);

    this.mortgageService.getFinancialProfile().subscribe({
      next: (profile) => {
        this.financialProfile.set(profile);
        this.loadingProfile.set(false);
      },
      error: () => {
        this.errorProfile.set('Error al cargar el perfil financiero');
        this.loadingProfile.set(false);
      }
    });
  }

  /**
   * Cargar capacidad hipotecaria con config actual
   */
  loadMortgageCapacity(): void {
    this.loadingCapacity.set(true);
    this.errorCapacity.set(null);

    const config = this.getConfigFromForm();

    this.mortgageService.getMortgageCapacity(config).subscribe({
      next: (result) => {
        this.mortgageResult.set(result);
        this.loadingCapacity.set(false);
      },
      error: () => {
        this.errorCapacity.set('Error al calcular la capacidad hipotecaria');
        this.loadingCapacity.set(false);
      }
    });
  }

  /**
   * Recalcular con nueva configuracion
   */
  recalculate(): void {
    if (this.configForm.invalid) return;
    this.loadMortgageCapacity();
  }

  /**
   * Analizar precio objetivo
   */
  analyzeTargetPrice(): void {
    if (this.targetForm.invalid) return;

    this.loadingTarget.set(true);
    this.errorTarget.set(null);

    const targetPrice = this.targetForm.value.target_price;
    const config = this.getConfigFromForm();

    this.mortgageService.analyzeTargetPrice(targetPrice, config).subscribe({
      next: (result) => {
        this.targetAnalysis.set(result);
        this.loadingTarget.set(false);
      },
      error: () => {
        this.errorTarget.set('Error al analizar el precio objetivo');
        this.loadingTarget.set(false);
      }
    });
  }

  /**
   * Seleccionar escenario
   */
  selectScenario(scenario: 'conservative' | 'balanced' | 'aggressive'): void {
    this.selectedScenario.set(scenario);
  }

  /**
   * Obtener configuracion del formulario
   */
  private getConfigFromForm() {
    const values = this.configForm.value;
    return {
      interest_rate: values.interest_rate / 100, // Convertir a decimal
      years: values.years,
      down_payment_ratio: values.down_payment_ratio / 100 // Convertir a decimal
    };
  }

  /**
   * Actualizar todo
   */
  refreshAll(): void {
    this.loadFinancialProfile();
    this.loadMortgageCapacity();
    this.targetAnalysis.set(null);
  }

  // ========== Formatters ==========

  formatCurrency(value: number | undefined, currency = 'EUR'): string {
    if (value === undefined || value === null) return '0 EUR';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercent(value: number | undefined): string {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(1)}%`;
  }

  formatPercentWithSign(value: number | undefined): string {
    if (value === undefined || value === null) return '0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  // ========== Health Status Helpers ==========

  getHealthStatusLabel(status: HealthStatus): string {
    const labels: Record<HealthStatus, string> = {
      excellent: 'Excelente',
      good: 'Bueno',
      fair: 'Aceptable',
      needs_improvement: 'Necesita mejora',
      critical: 'Critico'
    };
    return labels[status] || status;
  }

  getHealthStatusClass(status: HealthStatus): string {
    return `health-${status}`;
  }

  // ========== Risk Score Helpers ==========

  getRiskLabel(risk: RiskLevel): string {
    const labels: Record<RiskLevel, string> = {
      low: 'Bajo',
      medium: 'Medio',
      high: 'Alto'
    };
    return labels[risk] || risk;
  }

  getRiskClass(risk: RiskLevel): string {
    return `risk-${risk}`;
  }

  // ========== Scenario Helpers ==========

  getScenarioLabel(scenario: 'conservative' | 'balanced' | 'aggressive'): string {
    const labels = {
      conservative: 'Conservador',
      balanced: 'Equilibrado',
      aggressive: 'Agresivo'
    };
    return labels[scenario];
  }

  getScenarioDescription(scenario: 'conservative' | 'balanced' | 'aggressive'): string {
    const descriptions = {
      conservative: 'Menor riesgo, mayor margen de seguridad',
      balanced: 'Equilibrio entre precio y seguridad',
      aggressive: 'Mayor precio, menor margen de maniobra'
    };
    return descriptions[scenario];
  }

  getScenarioIcon(scenario: 'conservative' | 'balanced' | 'aggressive'): string {
    const icons = {
      conservative: 'shield',
      balanced: 'balance',
      aggressive: 'rocket'
    };
    return icons[scenario];
  }

  // ========== Math helpers for template ==========

  abs(value: number): number {
    return Math.abs(value);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // ========== Scenario Data Helper ==========

  getScenarioData(scenario: 'conservative' | 'balanced' | 'aggressive'): MortgageScenario | null {
    const result = this.mortgageResult();
    return result?.scenarios[scenario] || null;
  }
}
