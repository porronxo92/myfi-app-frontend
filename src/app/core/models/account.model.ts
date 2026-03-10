export interface Account {
  id: string;
  user_id: string;
  name: string;
  account_name?: string; // Alias para compatibilidad
  type: string;
  balance: number;
  currency: string;
  bank_name: string;
  account_number: string;
  is_active: boolean;
  notes: string;
  created_at: string;
  transaction_count: number;
  calculated_balance: number;
}

export interface CreateAccountDto {
  name: string;
  type: string;
  balance: number;
  currency: string;
  bank_name: string;
  account_number?: string;
  is_active: boolean;
  notes?: string;
  user_id: string;
}
