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

export interface TransferDto {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string;
  date: string;
  notes?: string;
  tags?: string[];
}

export interface TransferResponse {
  expense_transaction: Transaction;
  income_transaction: Transaction;
}

export interface BulkTransactionError {
  index: number;
  error: string;
}

export interface BulkTransactionResponse {
  created: number;
  failed: number;
  errors: BulkTransactionError[];
}
