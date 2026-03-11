import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="account-header">
      <!-- Logo y título -->
      <div class="header-top">
        <div class="bank-logo-container">
          <img 
            [src]="getBankLogoPath(bankName)" 
            [alt]="bankName"
            class="bank-logo"
            (error)="onImageError($event)"
          />
        </div>
        <div class="account-title-section">
          <div class="title-row">
            <h1 class="account-title">{{ accountName }}</h1>
            <span class="account-status" [class.active]="isActive" [class.inactive]="!isActive">
              {{ isActive ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <p class="account-type">{{ getAccountTypeLabel(accountType) }}</p>
        </div>
      </div>

      <!-- Información de la cuenta -->
      <div class="account-details">
        <div class="detail-row">
          <div class="detail-item" *ngIf="iban">
            <span class="detail-label">IBAN</span>
            <span class="detail-value iban">{{ iban }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Banco</span>
            <span class="detail-value">{{ bankName }}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-item">
            <span class="detail-label">Moneda</span>
            <span class="detail-value">{{ currency }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Transacciones</span>
            <span class="detail-value">{{ transactionCount }}</span>
          </div>
        </div>

        <div class="detail-row" *ngIf="notes">
          <div class="detail-item full-width">
            <span class="detail-label">Notas</span>
            <span class="detail-value">{{ notes }}</span>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-item">
            <span class="detail-label">Fecha de creación</span>
            <span class="detail-value">{{ formatDate(createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-header {
      background: var(--bg-card);
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      margin-bottom: var(--space-5);
    }

    .header-top {
      display: flex;
      align-items: flex-start;
      gap: var(--space-5);
      margin-bottom: var(--space-5);
      padding-bottom: var(--space-5);
      border-bottom: 1px solid var(--color-slate-600);
    }

    .bank-logo-container {
      flex-shrink: 0;
      width: 72px;
      height: 72px;
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      border: var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bank-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .account-title-section {
      flex: 1;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
    }

    .account-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .account-status {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .account-status.active {
      background: rgba(34, 160, 107, 0.15);
      color: var(--color-positive);
    }

    .account-status.inactive {
      background: rgba(202, 53, 33, 0.15);
      color: var(--color-negative);
    }

    .account-type {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0;
      font-weight: 500;
    }

    .account-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .detail-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-5);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-size: 0.875rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    .detail-value.iban {
      font-family: var(--font-data);
      color: var(--color-accent);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .account-header {
        padding: var(--space-4);
      }

      .header-top {
        flex-direction: column;
        gap: var(--space-3);
      }

      .bank-logo-container {
        width: 56px;
        height: 56px;
      }

      .account-title {
        font-size: 1.25rem;
      }

      .detail-row {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }
    }
  `]
})
export class AccountHeaderComponent {
  @Input() accountName: string = '';
  @Input() accountType: string = '';
  @Input() iban: string = '';
  @Input() bankName: string = '';
  @Input() currency: string = 'EUR';
  @Input() transactionCount: number = 0;
  @Input() notes: string = '';
  @Input() createdAt: string = '';
  @Input() isActive: boolean = true;

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

  getAccountTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'checking': 'Cuenta Corriente',
      'savings': 'Cuenta de Ahorro',
      'investment': 'Inversión',
      'credit_card': 'Tarjeta de Crédito',
      'cash': 'Efectivo'
    };
    return types[type] || type;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
