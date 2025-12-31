import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-page">
      <!-- Columna izquierda: Branding -->
      <div class="branding-section">
        <div class="branding-content">
          <!-- Logo -->
          <div class="logo-container">
            <svg class="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="url(#gradient1)"/>
              <path d="M24 14v20M14 24h20" stroke="white" stroke-width="3" stroke-linecap="round"/>
              <circle cx="24" cy="24" r="8" stroke="white" stroke-width="2" fill="none"/>
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#2563eb"/>
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
      <div class="form-section" [class.dark-mode]="themeService.isDarkMode()">
        <!-- Theme Toggle Button -->
        <button 
          type="button" 
          class="theme-toggle" 
          (click)="themeService.toggleTheme()"
          [attr.aria-label]="themeService.isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        >
          <svg *ngIf="!themeService.isDarkMode()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <svg *ngIf="themeService.isDarkMode()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <div class="form-container">
          <!-- Header -->
          <div class="form-header">
            <h2 class="form-title">Crear cuenta</h2>
            <p class="form-subtitle">Únete a MyFi y toma el control de tus finanzas.</p>
          </div>

          <!-- Formulario -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">Correo electrónico *</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-input"
                placeholder="Ingresa tu correo"
                [class.input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
              <div class="error-message" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">El correo electrónico es requerido</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Por favor ingresa un correo válido</span>
              </div>
            </div>

            <!-- Username -->
            <div class="form-group">
              <label for="username" class="form-label">Usuario (opcional)</label>
              <input
                id="username"
                type="text"
                formControlName="username"
                class="form-input"
                placeholder="Ingresa tu nombre de usuario"
              />
            </div>

            <!-- Full Name -->
            <div class="form-group">
              <label for="fullName" class="form-label">Nombre completo (opcional)</label>
              <input
                id="fullName"
                type="text"
                formControlName="full_name"
                class="form-input"
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password" class="form-label">Contraseña *</label>
              <div class="input-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="form-input"
                  placeholder="Ingresa tu contraseña"
                  [class.input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="togglePassword()"
                  aria-label="Toggle password visibility"
                >
                  <svg *ngIf="!showPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg *ngIf="showPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
              <div class="error-message" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Mínimo 8 caracteres</span>
                <span *ngIf="registerForm.get('password')?.errors?.['pattern']">Debe tener mayúscula, minúscula y número</span>
              </div>
              <p class="password-hint">Mínimo 8 caracteres con mayúscula, minúscula y número</p>
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

            <!-- Success Message -->
            <div class="success-message" *ngIf="successMessage()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {{ successMessage() }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="submit-button"
              [disabled]="registerForm.invalid || loading()"
            >
              <span *ngIf="!loading()">Crear cuenta</span>
              <span *ngIf="loading()" class="loading-state">
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
                </svg>
                Creando cuenta...
              </span>
            </button>

            <!-- Login link -->
            <p class="signin-text">
              ¿Ya tienes una cuenta? <a routerLink="/login" class="signin-link">Inicia sesión</a>
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

    .register-page {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    /* ===== COLUMNA IZQUIERDA: BRANDING ===== */
    .branding-section {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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
      filter: drop-shadow(0 10px 25px rgba(59, 130, 246, 0.2));
    }

    .brand-name {
      font-size: 2.5rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .brand-tagline {
      font-size: 1.125rem;
      color: #475569;
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
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      top: -100px;
      right: -100px;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      bottom: 20%;
      left: -80px;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      top: 40%;
      left: 10%;
    }

    .branding-footer {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #cbd5e1;
      z-index: 2;
    }

    .branding-footer a {
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .branding-footer a:hover {
      color: #3b82f6;
    }

    /* ===== COLUMNA DERECHA: FORMULARIO ===== */
    .form-section {
      background: white;
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
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      color: #475569;
      z-index: 10;
    }

    .theme-toggle:hover {
      background: #e2e8f0;
      border-color: #cbd5e1;
      color: #3b82f6;
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
    }

    .form-title {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .form-subtitle {
      font-size: 0.9375rem;
      color: #64748b;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #0f172a;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      color: #0f172a;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input::placeholder {
      color: #94a3b8;
    }

    .form-input.input-error {
      border-color: #ef4444;
    }

    .form-input.input-error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .password-toggle:hover {
      color: #3b82f6;
    }

    .error-message {
      font-size: 0.8125rem;
      color: #ef4444;
    }

    .password-hint {
      font-size: 0.8125rem;
      color: #64748b;
      margin: 0;
    }

    .server-error {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
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
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      color: #15803d;
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
      color: white;
      background: #3b82f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .submit-button:hover:not(:disabled) {
      background: #2563eb;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .submit-button:disabled {
      background: #94a3b8;
      cursor: not-allowed;
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

    .signin-text {
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
    }

    .signin-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .signin-link:hover {
      color: #2563eb;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .register-page {
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: [''],
      full_name: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/) // Al menos 1 mayúscula, 1 minúscula, 1 número
      ]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Limpiar campos vacíos opcionales
    const formData = { ...this.registerForm.value };
    if (!formData.username) delete formData.username;
    if (!formData.full_name) delete formData.full_name;

    this.authService.register(formData).subscribe({
      next: (user) => {
        console.log('✅ Registro exitoso', user);
        this.successMessage.set('¡Cuenta creada! Redirigiendo al login...');
        this.loading.set(false);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true', email: user.email }
          });
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error en registro', error);
        this.errorMessage.set(error.message);
        this.loading.set(false);
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update(show => !show);
  }
}
