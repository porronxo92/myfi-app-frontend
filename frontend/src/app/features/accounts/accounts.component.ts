import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AddAccountModalComponent } from '../../shared/components/add-account-modal.component';
import { AccountCardComponent } from '../../shared/components/account-card.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, NavbarComponent, AddAccountModalComponent, AccountCardComponent],
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
    </div>
  `,
  styles: [`
    .accounts-page {
      min-height: 100vh;
      background: #f8fafc;
    }

    .page-container {
      max-width: 1400px;
      padding: 2rem;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0.25rem 0 0 0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon {
      width: 64px;
      height: 64px;
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .error-message {
      color: #ef4444;
      font-weight: 500;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .add-card {
      border: 2px dashed #cbd5e1;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 280px;
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-card:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .add-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .add-icon {
      width: 64px;
      height: 64px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
    }

    .add-text {
      color: #64748b;
      font-weight: 600;
      margin: 0;
      font-size: 1rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-state svg {
      color: #cbd5e1;
      margin-bottom: 1.5rem;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .empty-description {
      font-size: 0.9375rem;
      color: #94a3b8;
      margin: 0 0 1.5rem 0;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
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
      error: (error) => {
        console.error('Error al crear la cuenta:', error);
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
