import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <div class="header-text">
        <h1 class="page-title">Gestión de Movimientos</h1>
        <p class="page-subtitle">Consulta y gestiona tus transacciones financieras</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" (click)="transfer.emit()">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
          Transferir
        </button>
        <button class="btn btn-secondary" (click)="uploadStatement.emit()">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          Cargar extracto
        </button>
        <button class="btn btn-primary" (click)="newTransaction.emit()">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva Transacción
        </button>
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .header-text {
      flex: 1;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 1rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      white-space: nowrap;
    }

    .btn svg {
      flex-shrink: 0;
    }

    .btn-secondary {
      background-color: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #475569;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
    }

    .btn-primary:hover {
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: flex-start;
      }
    }
  `]
})
export class TransactionHeaderComponent {
  uploadStatement = output<void>();
  newTransaction = output<void>();
  transfer = output<void>();
}
