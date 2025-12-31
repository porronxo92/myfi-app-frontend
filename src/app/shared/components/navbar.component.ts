import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoutConfirmationModalComponent } from './logout-confirmation-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LogoutConfirmationModalComponent],
  template: `
    <nav class="navbar">
      <div class="navbar-content">
        <!-- Logo y Menú -->
        <div class="navbar-left">
          <h1 class="logo" (click)="navigateTo('/dashboard')">MyFi</h1>
          <div class="nav-menu">
            <a class="nav-link" [class.active]="isActive('/dashboard')" (click)="navigateTo('/dashboard')">Resumen</a>
            <a class="nav-link" [class.active]="isActive('/accounts')" (click)="navigateTo('/accounts')">Cuentas</a>
            <a class="nav-link" [class.active]="isActive('/transactions')" (click)="navigateTo('/transactions')">Movimientos</a>
            <a class="nav-link">Presupuesto</a>
            <a class="nav-link">Inversión</a>
          </div>
        </div>

        <!-- Usuario y Logout -->
        <div class="navbar-right">
          <div class="user-info">
            <div class="avatar">
              {{ (user()?.full_name || user()?.email || 'U')[0].toUpperCase() }}
            </div>
            <span class="user-name">{{ user()?.full_name || user()?.username || user()?.email }}</span>
          </div>
          <button class="btn-logout" (click)="handleLogout()" title="Cerrar sesión">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Modal de confirmación de logout -->
    <app-logout-confirmation-modal 
      *ngIf="showLogoutModal()"
      (cancel)="onCancelLogout()"
      (confirm)="onConfirmLogout()"
    />
  `,
  styles: [`
    .navbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 3rem;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      cursor: pointer;
      user-select: none;
    }

    .nav-menu {
      display: flex;
      gap: 1.5rem;
    }

    .nav-link {
      color: #64748b;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
      text-decoration: none;
    }

    .nav-link:hover {
      color: #3b82f6;
    }

    .nav-link.active {
      color: #3b82f6;
      position: relative;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -1.25rem;
      left: 0;
      right: 0;
      height: 2px;
      background: #3b82f6;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-name {
      color: #0f172a;
      font-weight: 500;
      font-size: 0.9375rem;
    }

    .btn-logout {
      width: 40px;
      height: 40px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: #fef2f2;
    }

    .btn-logout svg {
      width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .navbar-content {
        padding: 1rem;
      }

      .navbar-left {
        gap: 1.5rem;
      }

      .nav-menu {
        display: none;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  showLogoutModal = signal(false);

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  handleLogout(): void {
    this.showLogoutModal.set(true);
  }

  onCancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  onConfirmLogout(): void {
    this.showLogoutModal.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
