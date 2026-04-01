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
        <div class="header-right">
          <span
            class="account-status"
            [class.active]="isActive"
            [class.inactive]="!isActive"
          >
            {{ isActive ? 'Activa' : 'Inactiva' }}
          </span>
          <button
            *ngIf="showDeleteButton"
            class="delete-button"
            (click)="onDeleteClick($event)"
            title="Eliminar cuenta"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="card-body">
        <h3 class="account-name">{{ accountName }}</h3>
        <p class="account-type">{{ getAccountTypeLabel(accountType) }}</p>
        <p class="account-iban" *ngIf="accountNumber">{{ accountNumber | maskIban }}</p>
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
    /* ========================================
       ACCOUNT CARD - INSTITUTIONAL
       ======================================== */
    
    .account-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-subtle);
      padding: var(--space-5);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
    }

    .account-card:hover {
      border-color: var(--color-slate-500);
      background: var(--bg-hover);
    }

    .account-card.inactive {
      opacity: 0.5;
    }

    /* Header */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .bank-icon {
      width: 40px;
      height: 40px;
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      padding: var(--space-2);
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
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(202, 53, 33, 0.1);
      color: var(--color-negative);
      border: 1px solid rgba(202, 53, 33, 0.2);
    }

    .account-status.active {
      background: rgba(34, 160, 107, 0.1);
      color: var(--color-positive);
      border-color: rgba(34, 160, 107, 0.2);
    }

    .delete-button {
      background: transparent;
      border: none;
      padding: var(--space-2);
      cursor: pointer;
      color: var(--text-faint);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delete-button:hover {
      background: rgba(202, 53, 33, 0.1);
      color: var(--color-negative);
    }

    /* Body */
    .card-body {
      flex: 1;
      margin-bottom: var(--space-4);
    }

    .account-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--space-1) 0;
    }

    .account-type {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0 0 var(--space-3) 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .account-iban {
      font-family: var(--font-data);
      font-size: 0.75rem;
      color: var(--text-faint);
      margin: 0 0 var(--space-2) 0;
      letter-spacing: 0.02em;
    }

    .account-bank {
      font-size: 0.8125rem;
      color: var(--text-tertiary);
      font-weight: 500;
      margin: 0;
    }

    /* Footer */
    .card-footer {
      border-top: var(--border-subtle);
      padding-top: var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .balance-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .balance-label {
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--text-faint);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .balance-amount {
      font-family: var(--font-data);
      font-size: 1.125rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }

    .balance-amount.positive {
      color: var(--color-positive);
    }

    .balance-amount.negative {
      color: var(--color-negative);
    }

    .transactions-count {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-data);
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .account-card {
        padding: var(--space-4);
      }

      .account-name {
        font-size: 0.875rem;
      }

      .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
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
  @Input() showDeleteButton: boolean = false;

  @Output() cardClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();

  onImageError(event: any): void {
    event.target.src = 'assets/bank_logo/default.svg';
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation(); // Prevenir que se active el cardClick
    this.deleteClick.emit();
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
