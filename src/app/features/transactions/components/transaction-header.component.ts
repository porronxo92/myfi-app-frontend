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
          Añadir movimiento
        </button>
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      gap: var(--space-5);
    }

    .header-text {
      flex: 1;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--space-1) 0;
      letter-spacing: -0.01em;
    }

    .page-subtitle {
      color: var(--text-muted);
      font-size: 0.8125rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
      flex-shrink: 0;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 100ms ease;
      border: none;
      white-space: nowrap;
    }

    .btn svg {
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-muted);
      border: var(--border-subtle);
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
      border-color: var(--color-slate-500);
      color: var(--text-primary);
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);
    }

    .btn-primary:hover {
      background: var(--color-accent-hover);
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
