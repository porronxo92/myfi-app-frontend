import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { AddAccountModalComponent } from '../../shared/components/add-account-modal.component';
import { AccountCardComponent } from '../../shared/components/account-card.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, AddAccountModalComponent, AccountCardComponent],
  template: `
    <div class="accounts-page">
      <app-navbar></app-navbar>

      <!-- Modal de añadir cuenta -->
      <app-add-account-modal 
        *ngIf="showModal()"
        (closeModal)="closeModal()"
        (accountCreated)="handleAccountCreated($event)"
      ></app-add-account-modal>

      <div class="page-container">
        <div class="page-header">
          <div>
            <h1 class="page-title">Mis Cuentas</h1>
            <p class="page-subtitle">Gestiona todas tus cuentas bancarias</p>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-container" *ngIf="isLoading()">
          <div class="spinner"></div>
          <p>Cargando cuentas...</p>
        </div>

        <!-- Error State -->
        <div class="error-container" *ngIf="hasError()">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="error-message">{{ errorMessage() }}</p>
        </div>

        <!-- Accounts Grid -->
        <div class="accounts-grid" *ngIf="!isLoading() && !hasError()">
          <!-- Existing Accounts -->
          <app-account-card
            *ngFor="let account of accounts(); trackBy: trackByAccountId"
            [accountName]="account.name"
            [accountType]="account.type"
            [accountNumber]="account.account_number"
            [bankName]="account.bank_name"
            [bankLogo]="getBankLogoPath(account.bank_name)"
            [balance]="account.balance"
            [transactionCount]="account.transaction_count || 0"
            [isActive]="account.is_active"
            [showTransactionCount]="true"
            (cardClick)="navigateToAccount(account.id)"
          ></app-account-card>

          <!-- Add Account Card (al final) -->
          <div class="account-card add-card" (click)="openModal()">
            <div class="add-card-content">
              <div class="add-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <p class="add-text">Añadir nueva cuenta</p>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="accounts().length === 0">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <h3 class="empty-title">No tienes cuentas registradas</h3>
            <p class="empty-description">Añade tu primera cuenta para empezar a gestionar tus finanzas</p>
            <button class="btn-primary" (click)="addAccount()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m8-8H4"/>
              </svg>
              Añadir primera cuenta
            </button>
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    /* ========================================
       ACCOUNTS PAGE - INSTITUTIONAL
       ======================================== */
    
    .accounts-page {
      min-height: 100vh;
      background: var(--bg-app);
    }

    .page-container {
      max-width: 1440px;
      padding: var(--space-6);
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: var(--space-1) 0 0 0;
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);
      border: none;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      transition: all var(--transition-fast);
    }

    .btn-primary:hover {
      background: var(--color-accent-hover);
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-16) var(--space-6);
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 2px solid var(--bg-hover);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: var(--space-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon {
      width: 48px;
      height: 48px;
      color: var(--color-negative);
      margin-bottom: var(--space-4);
    }

    .error-message {
      color: var(--color-negative);
      font-weight: 500;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-5);
    }

    /* Add Account Card */
    .add-card {
      border: var(--border-default);
      border-style: dashed;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 240px;
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .add-card:hover {
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
    }

    .add-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }

    .add-icon {
      width: 48px;
      height: 48px;
      background: var(--bg-hover);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent);
      transition: all var(--transition-fast);
    }

    .add-card:hover .add-icon {
      background: var(--color-accent);
      color: var(--color-slate-950);
    }

    .add-text {
      color: var(--text-muted);
      font-weight: 500;
      margin: 0;
      font-size: 0.875rem;
    }

    /* Empty State */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--space-16) var(--space-6);
    }

    .empty-state svg {
      color: var(--text-faint);
      margin-bottom: var(--space-4);
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-muted);
      margin: 0 0 var(--space-2) 0;
    }

    .empty-description {
      font-size: 0.875rem;
      color: var(--text-faint);
      margin: 0 0 var(--space-5) 0;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: var(--space-4);
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-4);
      }

      .accounts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountsComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);

  accounts = this.accountService.accounts;
  isLoading = this.accountService.loading;
  hasError = computed(() => this.accountService.error() !== null);
  errorMessage = this.accountService.error;
  showModal = signal(false);

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe();
  }

  navigateToAccount(accountId: string): void {
    this.router.navigate(['/accounts', accountId]);
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  handleAccountCreated(accountData: any): void {
    // Aquí se llamará al servicio para crear la cuenta en el backend
    this.accountService.createAccount(accountData).subscribe({
      next: () => {
        this.closeModal();
        // Recargar la lista de cuentas
        this.accountService.getAccounts().subscribe();
      },
      error: () => {
        console.error('Error al crear la cuenta');
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  getBankLogoPath(bankName: string): string {
    // Normalizar el nombre del banco para el nombre del archivo
    const normalizedName = bankName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ñ/g, 'n')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return `assets/bank_logo/${normalizedName}.svg`;
  }

  onImageError(event: any): void {
    // Si la imagen no se encuentra, usar una imagen por defecto
    event.target.src = 'assets/bank_logo/default.svg';
  }

  addAccount(): void {
    this.openModal();
  }

  trackByAccountId(index: number, account: any): string {
    return account.id;
  }
}
