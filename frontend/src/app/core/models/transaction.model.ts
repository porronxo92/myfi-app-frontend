export interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  transaction_type?: 'income' | 'expense';
  type?: 'income' | 'expense';
  description: string;
  transaction_date?: string;
  date?: string;
  created_at: string;
  updated_at?: string;
  category_name?: string | null;
  account_name?: string | null;
  category_color?: string | null;
  notes?: string;
  tags?: string[];
  source?: string;
}

export interface CreateTransactionDto {
  account_id: string;
  category_id?: string;
  amount: number;
  transaction_type?: 'income' | 'expense';
  type?: 'income' | 'expense';
  description: string;
  transaction_date?: string;
  date?: string;
}
