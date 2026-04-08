import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="forgot-password-page">
      <!-- Columna izquierda: Branding -->
      <div class="branding-section">
        <div class="branding-content">
          <!-- Logo -->
          <div class="logo-container">
            <svg class="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="url(#gradient1)"/>
              <path d="M24 14v20M14 24h20" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
              <circle cx="24" cy="24" r="8" stroke="#0F172A" stroke-width="2" fill="none"/>
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stop-color="#B5924C"/>
                  <stop offset="100%" stop-color="#8A6F3A"/>
                </linearGradient>
              </defs>
            </svg>
            <h1 class="brand-name">MyFi</h1>
          </div>

          <!-- Tagline -->
          <p class="brand-tagline">Gestiona tus finanzas personales con inteligencia y simplicidad</p>

          <!-- Decorative shapes -->
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>

        <!-- Footer Links -->
        <footer class="branding-footer">
          <a href="#about">Acerca de</a>
          <a href="#privacy">Privacidad</a>
          <a href="#terms">Términos de uso</a>
          <a href="#faq">Preguntas frecuentes</a>
        </footer>
      </div>

      <!-- Columna derecha: Formulario -->
      <div class="form-section">
        <!-- Theme Toggle Button -->
        <button
          type="button"
          class="theme-toggle"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.getToggleAriaLabel()"
        >
          <svg *ngIf="themeService.isDark()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg *ngIf="themeService.isLight()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <div class="form-container">
          <!-- Header -->
          <div class="form-header">
            <div class="form-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 class="form-title">Recuperar contraseña</h2>
            <p class="form-subtitle">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
          </div>

          <!-- Formulario -->
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form">
            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">Correo electrónico</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-input"
                placeholder="Ingresa tu correo"
                [class.input-error]="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched"
              />
              <div class="error-message" *ngIf="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched">
                <span *ngIf="forgotForm.get('email')?.errors?.['required']">El correo electrónico es requerido</span>
                <span *ngIf="forgotForm.get('email')?.errors?.['email']">Por favor ingresa un correo válido</span>
              </div>
            </div>

            <!-- Mensaje de éxito -->
            <div class="success-message" *ngIf="successMessage()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {{ successMessage() }}
            </div>

            <!-- Error del servidor -->
            <div class="server-error" *ngIf="errorMessage()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {{ errorMessage() }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="submit-button"
              [disabled]="forgotForm.invalid || loading() || !!successMessage()"
            >
              <span *ngIf="!loading()">Enviar enlace de recuperación</span>
              <span *ngIf="loading()" class="loading-state">
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
                </svg>
                Enviando...
              </span>
            </button>

            <!-- Back to login -->
            <p class="back-text">
              <a routerLink="/login" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver al inicio de sesión
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .forgot-password-page {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    /* ===== COLUMNA IZQUIERDA: BRANDING ===== */
    .branding-section {
      background: var(--bg-surface);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 4rem 3rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .branding-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 2;
      position: relative;
    }

    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .logo-icon {
      width: 80px;
      height: 80px;
      filter: drop-shadow(0 10px 25px rgba(181, 146, 76, 0.3));
    }

    .brand-name {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #B5924C 0%, #D4B978 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .brand-tagline {
      font-size: 1.125rem;
      color: var(--text-muted);
      text-align: center;
      max-width: 400px;
      line-height: 1.6;
    }

    /* Formas decorativas */
    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.4;
      z-index: 1;
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #B5924C 0%, #8A6F3A 100%);
      top: -100px;
      right: -100px;
      opacity: 0.15;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #334155 0%, #475569 100%);
      bottom: 20%;
      left: -80px;
      opacity: 0.3;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      background: linear-gradient(135deg, #B5924C 0%, #D4B978 100%);
      top: 40%;
      left: 10%;
      opacity: 0.1;
    }

    .branding-footer {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding-top: 2rem;
      border-top: var(--border-subtle);
      z-index: 2;
    }

    .branding-footer a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .branding-footer a:hover {
      color: var(--color-accent);
    }

    /* ===== COLUMNA DERECHA: FORMULARIO ===== */
    .form-section {
      background: var(--bg-card);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
    }

    /* Theme Toggle Button */
    .theme-toggle {
      position: absolute;
      top: 2rem;
      right: 2rem;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--bg-elevated);
      border: var(--border-default);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      color: var(--text-muted);
      z-index: 10;
    }

    .theme-toggle:hover {
      background: var(--bg-hover);
      border-color: var(--color-accent);
      color: var(--color-accent);
      transform: rotate(15deg);
    }

    .theme-toggle:active {
      transform: scale(0.95) rotate(15deg);
    }

    .form-container {
      width: 100%;
      max-width: 420px;
    }

    .form-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .form-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
      color: var(--color-accent);
    }

    .form-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .form-subtitle {
      font-size: 0.9375rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .forgot-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      color: var(--text-primary);
      background: var(--input-bg);
      border: var(--input-border);
      border-radius: 12px;
      transition: all 0.2s;
      box-shadow: var(--input-shadow);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-subtle);
    }

    .form-input::placeholder {
      color: var(--text-faint);
    }

    .form-input.input-error {
      border-color: var(--color-negative);
    }

    .form-input.input-error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .error-message {
      font-size: 0.8125rem;
      color: var(--color-negative);
    }

    .server-error {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      color: var(--color-negative);
      font-size: 0.875rem;
    }

    .server-error svg {
      flex-shrink: 0;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      color: var(--color-positive);
      font-size: 0.875rem;
    }

    .success-message svg {
      flex-shrink: 0;
    }

    .submit-button {
      width: 100%;
      padding: 0.875rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #0F172A;
      background: linear-gradient(135deg, #B5924C 0%, #9A7B3D 100%);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(181, 146, 76, 0.25);
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(181, 146, 76, 0.35);
    }

    .submit-button:disabled {
      background: var(--color-slate-600);
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .back-text {
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--color-accent);
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .forgot-password-page {
        grid-template-columns: 1fr;
      }

      .branding-section {
        display: none;
      }

      .form-section {
        padding: 3rem 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .form-section {
        padding: 2rem 1rem;
      }

      .form-title {
        font-size: 1.75rem;
      }

      .form-container {
        max-width: 100%;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.successMessage.set(
          'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.'
        );
        this.loading.set(false);
        this.forgotForm.reset();
      },
      error: () => {
        // Por seguridad, siempre mostramos mensaje de éxito
        // para no revelar si el email existe
        this.successMessage.set(
          'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.'
        );
        this.loading.set(false);
        this.forgotForm.reset();
      }
    });
  }
}
