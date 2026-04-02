import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LogoutConfirmationModalComponent } from './logout-confirmation-modal.component';
import { SafeImagePipe } from '../pipes/safe-image.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LogoutConfirmationModalComponent, SafeImagePipe],
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
            <a class="nav-link" [class.active]="isActive('/budget')" (click)="navigateTo('/budget')">Presupuesto</a>
            <a class="nav-link" [class.active]="isActive('/investment')" (click)="navigateTo('/investment')">Inversión</a>
          </div>
        </div>

        <!-- Usuario y Logout -->
        <div class="navbar-right">
          <!-- Theme Toggle -->
          <button 
            class="btn-theme-toggle" 
            (click)="themeService.toggle()" 
            [attr.aria-label]="themeService.getToggleAriaLabel()"
            title="Cambiar tema">
            @if (themeService.isDark()) {
              <!-- Sun icon - show when dark (click to go light) -->
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" stroke-width="2"/>
                <path stroke-linecap="round" stroke-width="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            } @else {
              <!-- Moon icon - show when light (click to go dark) -->
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            }
          </button>

          <div class="user-info" (click)="navigateTo('/account-settings')" title="Configuración de cuenta">
            <div class="avatar">
              @if (user()?.profile_picture) {
                <img [src]="user()!.profile_picture | safeImage" [alt]="user()?.full_name || 'Usuario'" class="avatar-img">
              } @else {
                {{ (user()?.full_name || user()?.email || 'U')[0].toUpperCase() }}
              }
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
        <a class="nav-link-mobile" [class.active]="isActive('/budget')" (click)="navigateToMobile('/budget')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span>Presupuesto</span>
        </a>
        <a class="nav-link-mobile" [class.active]="isActive('/investment')" (click)="navigateToMobile('/investment')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          <span>Inversión</span>
        </a>
        <a class="nav-link-mobile" [class.active]="isActive('/account-settings')" (click)="navigateToMobile('/account-settings')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>Configuración</span>
        </a>
        
        <div class="mobile-divider"></div>
        
        <!-- Usuario en móvil -->
        <div class="user-info-mobile" (click)="navigateToMobile('/account-settings')">
          <div class="avatar">
            @if (user()?.profile_picture) {
              <img [src]="user()!.profile_picture | safeImage" [alt]="user()?.full_name || 'Usuario'" class="avatar-img">
            } @else {
              {{ (user()?.full_name || user()?.email || 'U')[0].toUpperCase() }}
            }
          </div>
          <div class="user-details">
            <span class="user-name-mobile">{{ user()?.full_name || user()?.username || user()?.email }}</span>
            <span class="user-email-mobile">{{ user()?.email }}</span>
          </div>
        </div>
        
        <!-- Logout en móvil -->
        <a class="nav-link-mobile logout-link" (click)="handleLogoutMobile()">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Cerrar sesión</span>
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
    /* ========================================
       NAVBAR - INSTITUTIONAL DESIGN
       ======================================== */
    
    .navbar {
      background: var(--bg-surface);
      border-bottom: var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-content {
      max-width: 1440px;
      margin: 0 auto;
      padding: var(--space-3) var(--space-6);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: var(--space-10);
    }

    /* Logo - Clean Typography */
    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-accent);
      letter-spacing: -0.02em;
      margin: 0;
      cursor: pointer;
      user-select: none;
      transition: color var(--transition-fast);
    }

    .logo:hover {
      color: var(--color-accent-hover);
    }

    /* Navigation Menu */
    .nav-menu {
      display: flex;
      gap: var(--space-1);
    }

    .nav-link {
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      letter-spacing: var(--tracking-wide);
    }

    .nav-link:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    .nav-link.active {
      color: var(--color-accent);
      background: var(--color-accent-subtle);
      position: relative;
    }

    /* Active indicator - bottom line */
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -0.75rem;
      left: var(--space-3);
      right: var(--space-3);
      height: 2px;
      background: var(--color-accent);
      border-radius: 1px;
    }

    /* Right Section */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    /* User Info */
    .user-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      cursor: pointer;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
      border: var(--border-subtle);
    }

    .user-info:hover {
      background: var(--bg-hover);
      border-color: var(--color-slate-500);
    }

    /* Avatar */
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background: var(--color-accent);
      color: var(--color-slate-950);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-name {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.8125rem;
    }

    /* Logout Button */
    .btn-logout {
      width: 36px;
      height: 36px;
      border: var(--border-subtle);
      background: transparent;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-logout:hover {
      border-color: var(--color-negative);
      color: var(--color-negative);
      background: rgba(202, 53, 33, 0.08);
    }

    .btn-logout svg {
      width: 18px;
      height: 18px;
    }

    /* Theme Toggle Button */
    .btn-theme-toggle {
      width: 36px;
      height: 36px;
      border: var(--border-subtle);
      background: transparent;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-theme-toggle:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      background: var(--color-accent-subtle);
    }

    .btn-theme-toggle svg {
      width: 18px;
      height: 18px;
    }

    /* Hamburger Button */
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
      width: 20px;
      height: 2px;
      background: var(--text-muted);
      border-radius: 1px;
      transition: all 0.25s ease;
      transform-origin: center;
    }

    .btn-hamburger.open span:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }

    .btn-hamburger.open span:nth-child(2) {
      opacity: 0;
    }

    .btn-hamburger.open span:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }

    /* Mobile Menu */
    .mobile-menu {
      position: fixed;
      top: 57px;
      right: -100%;
      width: 280px;
      height: calc(100vh - 57px);
      background: var(--bg-surface);
      border-left: var(--border-subtle);
      transition: right 0.25s ease;
      z-index: 99;
      overflow-y: auto;
      padding: var(--space-4) 0;
    }

    .mobile-menu.open {
      right: 0;
    }

    .nav-link-mobile {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
      border-left: 2px solid transparent;
    }

    .nav-link-mobile:hover:not(.disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-left-color: var(--color-accent);
    }

    .nav-link-mobile.active {
      background: var(--color-accent-subtle);
      color: var(--color-accent);
      border-left-color: var(--color-accent);
    }

    .nav-link-mobile.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-link-mobile svg {
      width: 18px;
      height: 18px;
    }

    .nav-link-mobile span {
      font-size: 0.875rem;
    }

    .nav-link-mobile.logout-link {
      color: var(--color-negative);
      margin-top: var(--space-2);
    }

    .nav-link-mobile.logout-link:hover {
      background: rgba(202, 53, 33, 0.08);
      color: var(--color-negative);
      border-left-color: var(--color-negative);
    }

    /* Divider */
    .mobile-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: var(--space-4) 0;
    }

    /* Mobile User Info */
    .user-info-mobile {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      background: var(--bg-elevated);
      border-left: 2px solid var(--color-accent);
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .user-info-mobile:hover {
      background: var(--color-accent-subtle);
    }

    .user-info-mobile .avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--color-accent);
      color: var(--color-slate-950);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.8125rem;
      overflow: hidden;
      flex-shrink: 0;
    }

    .user-info-mobile .avatar .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .user-name-mobile {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email-mobile {
      color: var(--text-muted);
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Overlay */
    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--overlay-bg);
      z-index: 98;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.25s, visibility 0.25s;
    }

    .mobile-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    /* Media Queries */
    @media (max-width: 780px) {
      .navbar-content {
        padding: var(--space-3) var(--space-4);
      }

      .navbar-left {
        gap: var(--space-4);
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
  public themeService = inject(ThemeService);

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

  handleLogoutMobile(): void {
    this.closeMobileMenu();
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
