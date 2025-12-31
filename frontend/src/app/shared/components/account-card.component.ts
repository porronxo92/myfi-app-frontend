import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaskIbanPipe } from '../pipes/mask-iban.pipe';

/**
 * Componente reutilizable para mostrar tarjetas de cuenta bancaria
 * Diseño único consistente en toda la aplicación
 * 
 * @example
 * <app-account-card
 *   [accountName]="'Cuenta Nómina'"
 *   [accountType]="'checking'"
 *   [accountNumber]="'ES1234567890'"
 *   [bankName]="'BBVA'"
 *   [bankLogo]="'assets/bank_logo/bbva.svg'"
 *   [balance]="5000"
 *   [transactionCount]="45"
 *   [isActive]="true"
 *   [showTransactionCount]="true"
 *   (cardClick)="handleClick()"
 * ></app-account-card>
 */
@Component({
  selector: 'app-account-card',
  standalone: true,
  imports: [CommonModule, MaskIbanPipe],
  template: `
    <div 
      class="account-card" 
      [class.inactive]="!isActive"
      (click)="cardClick.emit()"
    >
      <div class="card-header">
        <div class="bank-icon">
          <img 
            [src]="bankLogo" 
            [alt]="bankName"
            (error)="onImageError($event)"
          />
        </div>
        <span 
          class="account-status" 
          [class.active]="isActive" 
          [class.inactive]="!isActive"
        >
          {{ isActive ? 'Activa' : 'Inactiva' }}
        </span>
      </div>

      <div class="card-body">
        <h3 class="account-name">{{ accountName }}</h3>
        <p class="account-type">{{ getAccountTypeLabel(accountType) }}</p>
        <p class="account-iban">{{ accountNumber | maskIban }}</p>
        <p class="account-bank">{{ bankName }}</p>
      </div>

      <div class="card-footer">
        <div class="balance-info">
          <span class="balance-label">Balance</span>
          <span 
            class="balance-amount" 
            [class.positive]="balance >= 0" 
            [class.negative]="balance < 0"
          >
            {{ balance | currency:'EUR':'symbol':'1.2-2' }}
          </span>
        </div>
        <div class="transactions-count" *ngIf="showTransactionCount">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
          </svg>
          <span>{{ transactionCount }} movimientos</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }

    .account-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      border-color: #3b82f6;
    }

    .account-card.inactive {
      opacity: 0.5;
    }

    /* Header */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .bank-icon {
      width: 48px;
      height: 48px;
      background: #f8fafc;
      border-radius: 12px;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .bank-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .account-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #fee2e2;
      color: #dc2626;
    }

    .account-status.active {
      background: #dcfce7;
      color: #16a34a;
    }

    /* Body */
    .card-body {
      flex: 1;
      margin-bottom: 1rem;
    }

    .account-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .account-type {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.5rem 0;
      text-transform: capitalize;
    }

    .account-iban {
      font-size: 0.875rem;
      font-family: 'Courier New', monospace;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .account-bank {
      font-size: 0.875rem;
      color: #475569;
      font-weight: 500;
      margin: 0;
    }

    /* Footer */
    .card-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .balance-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .balance-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .balance-amount {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .balance-amount.positive {
      color: #16a34a;
    }

    .balance-amount.negative {
      color: #dc2626;
    }

    .transactions-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .account-card {
        padding: 1.25rem;
      }

      .account-name {
        font-size: 1rem;
      }

      .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `]
})
export class AccountCardComponent {
  @Input() accountName: string = '';
  @Input() accountType: string = '';
  @Input() accountNumber: string = '';
  @Input() bankName: string = '';
  @Input() bankLogo: string = '';
  @Input() balance: number = 0;
  @Input() transactionCount: number = 0;
  @Input() isActive: boolean = true;
  @Input() showTransactionCount: boolean = true;
  
  @Output() cardClick = new EventEmitter<void>();

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
}
