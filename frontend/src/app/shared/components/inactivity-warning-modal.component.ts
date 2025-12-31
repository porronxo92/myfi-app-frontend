import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InactivityTimeoutService } from '../../core/services/inactivity-timeout.service';

/**
 * Modal de advertencia de timeout por inactividad
 * 
 * Se muestra 30 segundos antes del logout automático
 * Permite al usuario extender la sesión o cerrar sesión manualmente
 */
@Component({
  selector: 'app-inactivity-warning-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="timeoutService.showWarning()">
      <div class="modal-container">
        <!-- Icono de advertencia -->
        <div class="warning-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <!-- Título -->
        <h2 class="modal-title">Sesión por expirar</h2>

        <!-- Mensaje -->
        <p class="modal-message">
          Tu sesión está a punto de cerrarse por inactividad.
        </p>

        <!-- Countdown -->
        <div class="countdown-container">
          <div class="countdown-circle">
            <span class="countdown-number">{{ timeoutService.remainingSeconds() }}</span>
          </div>
          <p class="countdown-text">segundos restantes</p>
        </div>

        <!-- Botones -->
        <div class="modal-actions">
          <button 
            type="button" 
            class="btn-secondary"
            (click)="logout()"
          >
            Cerrar sesión
          </button>
          <button 
            type="button" 
            class="btn-primary"
            (click)="extendSession()"
          >
            Continuar conectado
          </button>
        </div>

        <!-- Información adicional -->
        <p class="info-text">
          Por razones de seguridad, tu sesión se cierra automáticamente tras 5 minutos de inactividad.
        </p>
      </div>
    </div>
  `,
  styles: [`
    /* Overlay de fondo */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Contenedor del modal */
    .modal-container {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    /* Icono de advertencia */
    .warning-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s ease-in-out infinite;
    }

    .warning-icon svg {
      color: white;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 20px rgba(245, 158, 11, 0);
      }
    }

    /* Título */
    .modal-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.75rem;
    }

    /* Mensaje */
    .modal-message {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 2rem;
      line-height: 1.5;
    }

    /* Countdown */
    .countdown-container {
      margin-bottom: 2rem;
    }

    .countdown-circle {
      width: 100px;
      height: 100px;
      margin: 0 auto 0.75rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .countdown-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      font-variant-numeric: tabular-nums;
    }

    .countdown-text {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    /* Botones */
    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
      max-width: 180px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #6b7280;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
      color: #374151;
    }

    /* Información adicional */
    .info-text {
      font-size: 0.75rem;
      color: #9ca3af;
      margin: 0;
      line-height: 1.4;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .modal-container {
        background: #1f2937;
      }

      .modal-title {
        color: #f9fafb;
      }

      .modal-message {
        color: #d1d5db;
      }

      .countdown-text {
        color: #9ca3af;
      }

      .btn-secondary {
        background: #374151;
        color: #d1d5db;
      }

      .btn-secondary:hover {
        background: #4b5563;
        color: #f9fafb;
      }

      .info-text {
        color: #6b7280;
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .modal-container {
        padding: 1.5rem;
      }

      .modal-title {
        font-size: 1.5rem;
      }

      .modal-actions {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        max-width: 100%;
      }
    }
  `]
})
export class InactivityWarningModalComponent {
  
  constructor(public timeoutService: InactivityTimeoutService) {
    // Log cuando se muestra/oculta el modal
    effect(() => {
      if (this.timeoutService.showWarning()) {
        console.log('⚠️ Mostrando modal de advertencia de inactividad');
      }
    });
  }

  /**
   * Extiende la sesión cuando el usuario hace click en "Continuar conectado"
   */
  extendSession(): void {
    this.timeoutService.extendSession();
  }

  /**
   * Cierra sesión manualmente
   */
  logout(): void {
    // El servicio AuthService se encargará del logout
    this.timeoutService.stopMonitoring();
    // No necesitamos llamar a authService.logout() aquí porque
    // el usuario puede hacer click en "Cerrar sesión" del navbar
    window.location.href = '/login';
  }
}
