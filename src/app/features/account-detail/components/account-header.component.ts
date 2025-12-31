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
          <div class="detail-item">
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
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }

    .header-top {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .bank-logo-container {
      flex-shrink: 0;
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .account-title {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .account-status {
      padding: 0.375rem 0.875rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .account-status.active {
      background: #dcfce7;
      color: #16a34a;
    }

    .account-status.inactive {
      background: #fee2e2;
      color: #dc2626;
    }

    .account-type {
      font-size: 1rem;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    .account-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 0.9375rem;
      color: #0f172a;
      font-weight: 500;
    }

    .detail-value.iban {
      font-family: 'Courier New', monospace;
      color: #3b82f6;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .account-header {
        padding: 1.5rem;
      }

      .header-top {
        flex-direction: column;
        gap: 1rem;
      }

      .bank-logo-container {
        width: 60px;
        height: 60px;
      }

      .account-title {
        font-size: 1.5rem;
      }

      .detail-row {
        grid-template-columns: 1fr;
        gap: 1rem;
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
