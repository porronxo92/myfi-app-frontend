/**
 * Mortgage Models - Interfaces para la Calculadora de Capacidad Hipotecaria
 * API: /api/financial-analysis/*
 */

// Tipos de estado de salud financiera
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical';

// Tipos de nivel de riesgo
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * GET /api/financial-analysis/financial-profile
 * Perfil financiero del usuario
 */
export interface FinancialProfile {
  monthly_income: number;
  income_stability: number;
  fixed_expenses: number;
  variable_expenses: number;
  debt_payments: number;
  disposable_income: number;
  savings_rate_percentage: number;
  health_status: HealthStatus;
  currency: string;
  analysis_period_months: number;
}

/**
 * Escenario de capacidad hipotecaria (conservative/balanced/aggressive)
 */
export interface MortgageScenario {
  monthly_payment: number;
  loan_amount: number;
  max_price: number;
  required_down_payment: number;
  debt_to_income_ratio: number;
}

/**
 * GET/POST /api/financial-analysis/mortgage-capacity
 * Resultado del calculo de capacidad hipotecaria
 */
export interface MortgageCapacityResult {
  max_price: number;
  loan_amount: number;
  monthly_payment: number;
  required_down_payment: number;
  risk_score: RiskLevel;
  scenarios: {
    conservative: MortgageScenario;
    balanced: MortgageScenario;
    aggressive: MortgageScenario;
  };
  calculation_details: {
    savings_capacity: number;
    max_quota_by_savings: number;
    max_quota_by_income: number;
    final_max_quota: number;
    interest_rate: number;
    years: number;
    down_payment_ratio: number;
    income_stability_score: number;
    total_debt_ratio: number;
  };
  currency: string;
  metadata: {
    user_id: string;
    calculated_at: string;
    months_analyzed: number;
    data_summary: {
      avg_income: number;
      total_expenses: number;
      savings_rate: number;
    };
  };
}

/**
 * Configuracion para calculos de hipoteca
 * Usado en POST /mortgage-capacity y /mortgage-capacity/target-price
 */
export interface MortgageConfig {
  interest_rate?: number;
  years?: number;
  down_payment_ratio?: number;
  max_debt_ratio?: number;
  safety_margin?: number;
}

/**
 * Request body para POST /mortgage-capacity/target-price
 */
export interface TargetPriceRequest {
  target_price: number;
  config?: MortgageConfig;
}

/**
 * POST /api/financial-analysis/mortgage-capacity/target-price
 * Analisis de viabilidad de un precio objetivo
 */
export interface TargetPriceResult {
  target_price: number;
  loan_needed: number;
  down_payment_needed: number;
  monthly_payment_needed: number;
  is_viable: boolean;
  gap: number;
  resulting_debt_ratio: number;
  recommendation: string;
  comparison: {
    max_affordable_price: number;
    difference_from_max: number;
    percentage_of_max: number;
  };
  currency: string;
}
