export interface Category {
  id: string;
  user_id?: string;
  name: string;
  category_type?: 'income' | 'expense';
  type?: 'income' | 'expense';
  color: string;
  created_at: string;
  updated_at?: string;
  transaction_count?: number;
  total_amount?: number;
}

export interface CreateCategoryDto {
  name: string;
  category_type?: 'income' | 'expense';
  type?: 'income' | 'expense';
  color?: string;
}
