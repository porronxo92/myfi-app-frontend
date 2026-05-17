export interface Category {
  id: string;
  user_id?: string;
  name: string;
  /** Campo principal del backend. Puede venir como 'type' o 'category_type' según el endpoint. */
  type?: 'income' | 'expense';
  category_type?: 'income' | 'expense';
  color: string;
  created_at: string;
  updated_at?: string;
  transaction_count?: number;
  total_amount?: number;
}

export interface CreateCategoryDto {
  name: string;
  /** Se envía como 'type' y 'category_type' simultáneamente para compatibilidad con el backend. */
  type: 'income' | 'expense';
  category_type?: 'income' | 'expense';
  color?: string;
}
