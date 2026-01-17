import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta raíz - redirige según autenticación
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Rutas públicas (solo accesibles si NO estás autenticado)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard] // Si ya está logueado, redirige a dashboard
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [publicGuard]
  },

  // Rutas protegidas (requieren autenticación)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] // Solo accesible si está autenticado
  },
  {
    path: 'accounts',
    loadComponent: () => import('./features/accounts/accounts.component').then(m => m.AccountsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'accounts/:id',
    loadComponent: () => import('./features/account-detail/account-detail.component').then(m => m.AccountDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/transactions/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'transactions/upload',
    loadComponent: () => import('./features/transactions/upload-statement.component').then(m => m.UploadStatementComponent),
    canActivate: [authGuard]
  },
  {
    path: 'investment',
    loadComponent: () => import('./features/investment/investment.component').then(m => m.InvestmentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'budget',
    loadComponent: () => import('./features/budget/budget.component').then(m => m.BudgetComponent),
    canActivate: [authGuard]
  },
  {
    path: 'account-settings',
    loadComponent: () => import('./features/account-settings/account-settings.component').then(m => m.AccountSettingsComponent),
    canActivate: [authGuard]
  },

  // Ruta 404 - cualquier ruta no encontrada
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
