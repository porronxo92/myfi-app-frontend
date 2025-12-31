import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { AccountCardComponent } from '../../../shared/components/account-card.component';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, AccountCardComponent],
  template: `
    <div class="accounts-section">
      <div class="section-header">
        <h2 class="section-title">Mis Cuentas</h2>
      </div>

      <!-- Estado vacío -->
      <div class="empty-state" *ngIf="accounts().length === 0">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </div>
        <h3 class="empty-title">No tienes cuentas registradas</h3>
        <p class="empty-description">Añade tu primera cuenta para empezar a gestionar tus finanzas</p>
        <button class="btn-primary" (click)="addAccount.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 4v16m8-8H4"/>
          </svg>
          Añadir primera cuenta
        </button>
      </div>

      <!-- Grid de cuentas -->
      <div class="accounts-grid" *ngIf="accounts().length > 0">
        <!-- Tarjetas de cuentas existentes -->
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

        <!-- Tarjeta para añadir nueva cuenta -->
        <div class="account-card add-card" (click)="addAccount.emit()">
          <div class="add-card-content">
            <div class="add-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <p class="add-text">Añadir nueva cuenta</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accounts-section {
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .btn-add {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-add:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    /* Estado vacío */
    .empty-state {
      background: white;
      border-radius: 16px;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      color: #cbd5e1;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .empty-description {
      color: #64748b;
      margin: 0 0 2rem 0;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      background: #2563eb;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    /* Grid de cuentas */
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    /* Tarjeta para añadir cuenta */
    .add-card {
      background: white;
      border: 2px dashed #cbd5e1;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .add-card:hover {
      border-color: #3b82f6;
      background: #f8fafc;
      transform: translateY(-4px);
    }

    .add-card-content {
      text-align: center;
    }

    .add-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
    }

    .add-text {
      font-size: 1rem;
      font-weight: 600;
      color: #475569;
      margin: 0;
    }

    @media (max-width: 768px) {
      .accounts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountsListComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);
  
  @Output() addAccount = new EventEmitter<void>();
  
  accounts = this.accountService.accounts;

  navigateToAccount(accountId: string): void {
    console.log('🔗 Navegando a cuenta con ID:', accountId);
    console.log('🔗 Tipo de ID:', typeof accountId);
    console.log('🔗 Longitud del ID:', accountId?.length);
    this.router.navigate(['/accounts', accountId]);
  }

  trackByAccountId(index: number, account: any): string {
    return account.id;
  }

  getBankLogoPath(bankName: string): string {
    const normalizedName = bankName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ñ/g, 'n')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return `assets/bank_logo/${normalizedName}.svg`;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/bank_logo/default.svg';
  }
}
