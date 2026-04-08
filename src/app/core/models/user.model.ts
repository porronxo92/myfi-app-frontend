/**
 * Modelos de Usuario y Autenticación
 * Coinciden exactamente con los schemas de Pydantic del backend
 */

export interface User {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  profile_picture?: string | null;
  is_active: boolean;
  is_admin: boolean;
  last_login: string | null;
  created_at: string;
  account_count?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username?: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
}

// ============================================
// PASSWORD RESET INTERFACES
// ============================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  email: string | null;
}
