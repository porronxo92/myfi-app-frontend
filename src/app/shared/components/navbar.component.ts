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
          
          <!-- Menú Desktop -->
          <div class="nav-menu desktop">
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
          
          <!-- Botón Hamburguesa (solo móvil) -->
          <button class="btn-hamburger" (click)="toggleMobileMenu()" [class.open]="mobileMenuOpen()">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      <!-- Menú Móvil -->
      <div class="mobile-menu" [class.open]="mobileMenuOpen()">
        <a class="nav-link-mobile" [class.active]="isActive('/dashboard')" (click)="navigateToMobile('/dashboard')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Resumen</span>
        </a>
        <a class="nav-link-mobile" [class.active]="isActive('/accounts')" (click)="navigateToMobile('/accounts')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          <span>Cuentas</span>
        </a>
        <a class="nav-link-mobile" [class.active]="isActive('/transactions')" (click)="navigateToMobile('/transactions')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <span>Movimientos</span>
        </a>
        <a class="nav-link-mobile disabled">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span>Presupuesto</span>
        </a>
        <a class="nav-link-mobile disabled">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          <span>Inversión</span>
        </a>
      </div>
    </nav>

    <!-- Overlay para cerrar menú móvil -->
    <div class="mobile-overlay" [class.open]="mobileMenuOpen()" (click)="closeMobileMenu()"></div>

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

    /* Botón Hamburguesa */
    .btn-hamburger {
      display: none;
      flex-direction: column;
      justify-content: space-around;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      z-index: 110;
    }

    .btn-hamburger span {
      width: 24px;
      height: 2px;
      background: #64748b;
      border-radius: 2px;
      transition: all 0.3s;
      transform-origin: center;
    }

    .btn-hamburger.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .btn-hamburger.open span:nth-child(2) {
      opacity: 0;
    }

    .btn-hamburger.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* Menú Móvil */
    .mobile-menu {
      position: fixed;
      top: 65px;
      right: -100%;
      width: 280px;
      height: calc(100vh - 65px);
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 99;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .mobile-menu.open {
      right: 0;
    }

    .nav-link-mobile {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      color: #64748b;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      border-left: 3px solid transparent;
    }

    .nav-link-mobile:hover:not(.disabled) {
      background: #f8fafc;
      color: #3b82f6;
      border-left-color: #3b82f6;
    }

    .nav-link-mobile.active {
      background: #eff6ff;
      color: #3b82f6;
      border-left-color: #3b82f6;
    }

    .nav-link-mobile.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-link-mobile svg {
      width: 20px;
      height: 20px;
    }

    .nav-link-mobile span {
      font-size: 0.9375rem;
    }

    /* Overlay */
    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 98;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }

    .mobile-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    /* Media Queries */
    @media (max-width: 780px) {
      .navbar-content {
        padding: 1rem;
      }

      .navbar-left {
        gap: 1.5rem;
      }

      .nav-menu.desktop {
        display: none;
      }

      .user-name {
        display: none;
      }

      .btn-hamburger {
        display: flex;
      }

      .btn-logout {
        display: none;
      }
    }

    @media (min-width: 781px) {
      .mobile-menu,
      .mobile-overlay {
        display: none !important;
      }
    }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  showLogoutModal = signal(false);
  mobileMenuOpen = signal(false);

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToMobile(path: string): void {
    this.router.navigate([path]);
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
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
