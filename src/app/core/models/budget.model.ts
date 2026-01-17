/**
 * Modelos TypeScript para el módulo de Presupuestos
 */

// ============================================
// BUDGET ITEM INTERFACES
// ============================================

export interface BudgetItem {
  id: string;
  budget_id: string;
  category_id: string;
  category_name?: string;
  allocated_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItemCreate {
  category_id: string;
  allocated_amount: number;
  notes?: string;
}

export interface BudgetItemUpdate {
  category_id?: string;
  allocated_amount?: number;
  notes?: string;
}

// ============================================
// BUDGET INTERFACES
// ============================================

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_budget: number;
  name?: string;
  items: BudgetItem[];
  created_at: string;
  updated_at: string;
}

export interface BudgetListItem {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_budget: number;
  name?: string;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetCreate {
  month: number;
  year: number;
  name?: string;
  items: BudgetItemCreate[];
}

export interface BudgetUpdate {
  month?: number;
  year?: number;
  name?: string;
  items?: BudgetItemCreate[];
}

// ============================================
// BUDGET COPY INTERFACE
// ============================================

export interface BudgetCopyRequest {
  target_month: number;
  target_year: number;
}

// ============================================
// BUDGET PROGRESS INTERFACES
// ============================================

export interface ItemProgress {
  category_id: string;
  category_name: string;
  allocated: number;
  spent: number;
  remaining: number;
  percent_used: number;
  status: 'ok' | 'warning' | 'over';
  transaction_count: number;
}

export interface BudgetProgress {
  budget_id: string;
  month: number;
  year: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  percent_used: number;
  status: 'ok' | 'warning' | 'over';
  items: ItemProgress[];
}

// ============================================
// BUDGET SUMMARY INTERFACE
// ============================================

export interface BudgetSummary {
  budget_id: string;
  month: number;
  year: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  percent_used: number;
  status: 'ok' | 'warning' | 'over';
  overspent_categories: string[];
  categories_at_risk: string[];
  categories_ok: string[];
}

// ============================================
// BUDGET COMPARISON INTERFACES
// ============================================

export interface CategoryComparison {
  category_name: string;
  budget1_amount: number;
  budget2_amount: number;
  difference: number;
  percent_change: number;
}

export interface BudgetComparison {
  budget1_id: string;
  budget1_period: string;
  budget2_id: string;
  budget2_period: string;
  total_difference: number;
  categories: CategoryComparison[];
}

// ============================================
// SUGGESTED BUDGET INTERFACES
// ============================================

export interface SuggestedBudgetItem {
  category_id: string;
  category_name: string;
  suggested_amount: number;
  based_on_average: number;
  months_analyzed: number;
}

export interface SuggestedBudget {
  suggested_for_month: number;
  suggested_for_year: number;
  total_suggested: number;
  items: SuggestedBudgetItem[];
  analysis_period: string;
}

// ============================================
// OVERSPENT CATEGORY INTERFACE
// ============================================

export interface OverspentCategory {
  category_id: string;
  category_name: string;
  allocated: number;
  spent: number;
  overspent_amount: number;
  percent_over: number;
}

// ============================================
// HELPER TYPES
// ============================================

export type BudgetStatus = 'ok' | 'warning' | 'over';

export interface MonthYear {
  month: number;
  year: number;
}

// ============================================
// CONSTANTS
// ============================================

export const MONTH_NAMES = [
  '', // Index 0 no usado
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

export const STATUS_COLORS = {
  ok: '#10B981',      // Verde
  warning: '#F59E0B', // Amarillo
  over: '#EF4444'     // Rojo
};

export const STATUS_LABELS = {
  ok: 'En Orden',
  warning: 'Atención',
  over: 'Excedido'
};
