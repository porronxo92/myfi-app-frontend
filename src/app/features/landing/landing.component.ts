import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ========================================
         NAVBAR
         ======================================== -->
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="container">
        <div class="navbar-inner">
          <a class="navbar-logo" (click)="scrollToTop()">
            <div class="navbar-logo-mark">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="12" width="10" height="16" rx="2" fill="#B5924C"/>
                <rect x="18" y="4" width="10" height="24" rx="2" fill="#B5924C" fill-opacity="0.6"/>
              </svg>
            </div>
            <span class="navbar-logo-text">MyFi</span>
          </a>
          <div class="navbar-actions">
            <button class="btn btn-ghost btn-sm" (click)="navigateTo('/login')">Iniciar sesión</button>
            <button class="btn btn-primary btn-sm" (click)="navigateTo('/register')">Comenzar</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- ========================================
         HERO SECTION
         ======================================== -->
    <section class="hero">
      <div class="hero-grain"></div>
      <div class="container">
        <div class="hero-inner">
          <div class="hero-content">
            <p class="eyebrow hero-eyebrow">Gestión Patrimonial Profesional</p>
            <h1 class="hero-title">El control financiero que merece su patrimonio.</h1>
            <p class="hero-subtitle">Visibilidad total sobre sus cuentas, inversiones y presupuesto. Diseñado para quienes toman decisiones con los datos.</p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" (click)="navigateTo('/register')">Acceder a la plataforma</button>
              <button class="btn btn-ghost" (click)="scrollToFeatures()">Ver demostración</button>
            </div>
            <div class="hero-trust">
              <span class="hero-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                256-bit SSL
              </span>
              <span class="hero-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Datos cifrados
              </span>
              <span class="hero-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                Sin publicidad
              </span>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-visual-bg">
              <div class="hero-visual-line hero-visual-line-1"></div>
              <div class="hero-visual-line hero-visual-line-2"></div>
              <div class="hero-visual-line hero-visual-line-3"></div>
            </div>
            <div class="dashboard-mock">
              <p class="dashboard-mock-label">Patrimonio Total</p>
              <p class="dashboard-mock-value">€ 284,750.00</p>
              <div class="dashboard-mock-chart">
                <svg viewBox="0 0 300 60" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#B5924C" stop-opacity="0.3"/>
                      <stop offset="100%" stop-color="#B5924C" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0 55 Q30 50, 60 45 T120 35 T180 25 T240 20 T300 10 L300 60 L0 60 Z" fill="url(#chartGradient)"/>
                  <path d="M0 55 Q30 50, 60 45 T120 35 T180 25 T240 20 T300 10" stroke="#B5924C" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div class="dashboard-mock-stats">
                <span class="dashboard-mock-stat dashboard-mock-stat-positive">+12.4% Este año</span>
                <span class="dashboard-mock-stat dashboard-mock-stat-neutral">4 cuentas activas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================
         STATS BAR
         ======================================== -->
    <section class="stats-bar">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <p class="stat-number">€ 2.4M+</p>
            <p class="stat-label">Patrimonio gestionado</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">12,000+</p>
            <p class="stat-label">Transacciones registradas</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">4.9 / 5</p>
            <p class="stat-label">Valoración de usuarios</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">100%</p>
            <p class="stat-label">Privado. Sin venta de datos</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================
         FEATURES SECTION
         ======================================== -->
    <section class="features" id="features">
      <div class="container">
        <div class="features-header">
          <p class="eyebrow">Funcionalidades</p>
          <h2 class="section-title">Todo lo que necesita, nada que no.</h2>
          <p class="section-subtitle">Una plataforma construida para la complejidad financiera real.</p>
        </div>
        <div class="features-grid">
          <!-- Feature 1: Cuentas -->
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="10" width="36" height="28" rx="3"/>
                <path d="M6 18h36"/>
                <path d="M14 26h8M14 32h12"/>
              </svg>
            </div>
            <h3 class="feature-title">Cuentas</h3>
            <p class="feature-desc">Visión unificada de todas sus cuentas bancarias e inversiones en un solo panel de control.</p>
          </div>
          <!-- Feature 2: Transacciones -->
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 14h32M8 24h32M8 34h32"/>
                <circle cx="16" cy="14" r="3" fill="currentColor"/>
                <circle cx="24" cy="24" r="3" fill="currentColor"/>
                <circle cx="20" cy="34" r="3" fill="currentColor"/>
              </svg>
            </div>
            <h3 class="feature-title">Transacciones</h3>
            <p class="feature-desc">Registro inteligente de movimientos con categorización automática y búsqueda avanzada.</p>
          </div>
          <!-- Feature 3: Presupuesto -->
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="8" y="8" width="32" height="32" rx="3"/>
                <path d="M8 16h32"/>
                <path d="M16 8v8M32 8v8"/>
                <rect x="14" y="22" width="8" height="6" rx="1" fill="currentColor"/>
                <rect x="26" y="22" width="8" height="10" rx="1" fill="currentColor" fill-opacity="0.5"/>
              </svg>
            </div>
            <h3 class="feature-title">Presupuesto</h3>
            <p class="feature-desc">Control de gastos por categoría con alertas de desviación y seguimiento mensual.</p>
          </div>
          <!-- Feature 4: Análisis -->
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 40V20l10 8 10-16 12 12"/>
                <circle cx="18" cy="28" r="2" fill="currentColor"/>
                <circle cx="28" cy="12" r="2" fill="currentColor"/>
                <circle cx="40" cy="24" r="2" fill="currentColor"/>
              </svg>
            </div>
            <h3 class="feature-title">Análisis</h3>
            <p class="feature-desc">Métricas patrimoniales y evolución temporal de su capital con visualizaciones claras.</p>
          </div>
          <!-- Feature 5: Importación -->
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M24 32V8M24 8l-8 8M24 8l8 8"/>
                <path d="M8 28v10a4 4 0 004 4h24a4 4 0 004-4V28"/>
              </svg>
            </div>
            <h3 class="feature-title">Importación</h3>
            <p class="feature-desc">Carga masiva de extractos bancarios en múltiples formatos: CSV, XLS, XLSX.</p>
          </div>
          <!-- Feature 6: Privacidad -->
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M24 4L8 12v12c0 11 16 18 16 18s16-7 16-18V12L24 4z"/>
                <path d="M18 24l4 4 8-8"/>
              </svg>
            </div>
            <h3 class="feature-title">Privacidad</h3>
            <p class="feature-desc">Sus datos nunca salen de su control. Sin terceros, sin publicidad, sin compromiso.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================
         DASHBOARD PREVIEW
         ======================================== -->
    <section class="preview">
      <div class="container">
        <div class="preview-header">
          <p class="preview-header-title">Así se ve por dentro.</p>
        </div>
        <div class="preview-container">
          <div class="preview-navbar">
            <div class="preview-navbar-dots">
              <span class="preview-navbar-dot"></span>
              <span class="preview-navbar-dot"></span>
              <span class="preview-navbar-dot"></span>
            </div>
          </div>
          <div class="preview-body">
            <aside class="preview-sidebar">
              <div class="preview-sidebar-item active">
                <span class="preview-sidebar-icon"></span>
                Resumen
              </div>
              <div class="preview-sidebar-item">
                <span class="preview-sidebar-icon"></span>
                Cuentas
              </div>
              <div class="preview-sidebar-item">
                <span class="preview-sidebar-icon"></span>
                Movimientos
              </div>
              <div class="preview-sidebar-item">
                <span class="preview-sidebar-icon"></span>
                Presupuesto
              </div>
              <div class="preview-sidebar-item">
                <span class="preview-sidebar-icon"></span>
                Inversiones
              </div>
            </aside>
            <main class="preview-main">
              <div class="preview-card">
                <div class="preview-card-header">
                  <span class="preview-card-title">Balance Mensual</span>
                  <span class="preview-card-value">+€ 2,340</span>
                </div>
                <div class="preview-chart">
                  <svg viewBox="0 0 300 120" fill="none" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="previewGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#22A06B" stop-opacity="0.2"/>
                        <stop offset="100%" stop-color="#22A06B" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0 100 Q50 90, 100 70 T200 50 T300 30 L300 120 L0 120 Z" fill="url(#previewGrad1)"/>
                    <path d="M0 100 Q50 90, 100 70 T200 50 T300 30" stroke="#22A06B" stroke-width="2" fill="none"/>
                  </svg>
                </div>
              </div>
              <div class="preview-card">
                <div class="preview-card-header">
                  <span class="preview-card-title">Gastos por Categoría</span>
                </div>
                <div class="preview-chart">
                  <svg viewBox="0 0 300 120" fill="none">
                    <rect x="20" y="80" width="40" height="30" rx="2" fill="#B5924C"/>
                    <rect x="80" y="50" width="40" height="60" rx="2" fill="#B5924C" fill-opacity="0.7"/>
                    <rect x="140" y="30" width="40" height="80" rx="2" fill="#B5924C" fill-opacity="0.5"/>
                    <rect x="200" y="60" width="40" height="50" rx="2" fill="#B5924C" fill-opacity="0.4"/>
                    <rect x="260" y="90" width="30" height="20" rx="2" fill="#B5924C" fill-opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================
         FAQ SECTION
         ======================================== -->
    <section class="faq">
      <div class="container">
        <div class="faq-header">
          <h2 class="section-title">Preguntas frecuentes</h2>
        </div>
        <div class="faq-list">
          @for (item of faqItems; track item.question) {
            <div class="faq-item" [class.open]="item.open">
              <button class="faq-question" (click)="toggleFaq(item)">
                {{ item.question }}
                <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
              <div class="faq-answer">
                <p class="faq-answer-inner">{{ item.answer }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ========================================
         CTA SECTION
         ======================================== -->
    <section class="cta">
      <div class="container">
        <p class="eyebrow">Acceso Anticipado</p>
        <h2 class="section-title">La claridad financiera empieza aquí.</h2>
        <p class="section-subtitle">Únase a los profesionales que ya gestionan su patrimonio con precisión institucional.</p>
        <div class="cta-button">
          <button class="btn btn-primary btn-lg" style="min-width: 220px;" (click)="navigateTo('/register')">Crear cuenta gratuita</button>
        </div>
        <p class="cta-login">¿Ya tiene cuenta? <a (click)="navigateTo('/login')">Iniciar sesión</a></p>
      </div>
    </section>

    <!-- ========================================
         FOOTER
         ======================================== -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="navbar-logo" style="margin-bottom: 0;" (click)="scrollToTop()">
              <div class="navbar-logo-mark">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="12" width="10" height="16" rx="2" fill="#B5924C"/>
                  <rect x="18" y="4" width="10" height="24" rx="2" fill="#B5924C" fill-opacity="0.6"/>
                </svg>
              </div>
              <span class="navbar-logo-text">MyFi</span>
            </a>
            <p class="footer-brand-text">Gestión patrimonial para profesionales.</p>
            <p class="footer-copyright">© 2025 · Todos los derechos reservados</p>
          </div>
          <div class="footer-links">
            <p class="footer-links-title">Navegación</p>
            <a (click)="scrollToFeatures()">Funcionalidades</a>
            <a (click)="scrollToFaq()">FAQ</a>
            <a>Privacidad</a>
            <a>Términos</a>
          </div>
          <div class="footer-cta">
            <p class="footer-links-title">Acceso</p>
            <button class="btn btn-ghost btn-sm" (click)="navigateTo('/login')">Acceso a la plataforma</button>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-bottom-text">Plataforma independiente · Sin afiliación bancaria · Datos cifrados AES-256</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

    /* ========================================
       CSS CUSTOM PROPERTIES
       ======================================== */
    :host {
      display: block;
      --color-slate-950: #0B1120;
      --color-slate-900: #0F172A;
      --color-slate-850: #131C2E;
      --color-slate-800: #1E293B;
      --color-slate-700: #2D3A4F;
      --color-slate-600: #3D4A5F;
      --color-slate-500: #4F5D73;

      --color-platinum-100: #F8FAFC;
      --color-platinum-200: #E8ECF1;
      --color-platinum-300: #CBD5E1;
      --color-platinum-400: #94A3B8;
      --color-platinum-500: #64748B;

      --color-accent: #B5924C;
      --color-accent-hover: #C9A65E;
      --color-accent-muted: #8B7340;
      --color-accent-subtle: rgba(181, 146, 76, 0.12);

      --color-positive: #22A06B;
      --color-negative: #CA3521;

      --font-display: 'Cormorant Garamond', Georgia, serif;
      --font-body: 'DM Sans', -apple-system, sans-serif;
      --font-mono: 'IBM Plex Mono', monospace;

      --section-padding: 120px;
      --container-max: 1200px;

      background: var(--color-slate-950);
      color: var(--color-platinum-200);
      font-family: var(--font-body);
    }

    /* ========================================
       BASE STYLES
       ======================================== */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    a {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    button {
      font-family: inherit;
      cursor: pointer;
      border: none;
      background: none;
    }

    .container {
      max-width: var(--container-max);
      margin: 0 auto;
      padding: 0 24px;
    }

    .eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--color-accent);
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 48px;
      font-weight: 300;
      color: var(--color-platinum-100);
      line-height: 1.2;
    }

    .section-subtitle {
      font-size: 17px;
      color: var(--color-platinum-400);
      max-width: 560px;
    }

    /* ========================================
       KEYFRAMES
       ======================================== */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-24px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(24px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* ========================================
       BUTTONS
       ======================================== */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      border-radius: 4px;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--color-accent);
      color: var(--color-slate-950);
      padding: 0 32px;
      height: 48px;
    }

    .btn-primary:hover {
      background: var(--color-accent-hover);
      transform: scale(1.02);
      box-shadow: 0 8px 24px rgba(181, 146, 76, 0.25);
    }

    .btn-ghost {
      background: transparent;
      color: var(--color-accent);
      border: 1px solid var(--color-accent);
      padding: 0 24px;
      height: 48px;
    }

    .btn-ghost:hover {
      background: var(--color-accent-subtle);
      color: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
    }

    .btn-lg {
      height: 54px;
      padding: 0 40px;
      font-size: 15px;
    }

    .btn-sm {
      height: 40px;
      padding: 0 20px;
      font-size: 13px;
    }

    /* ========================================
       NAVBAR
       ======================================== */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 20px 0;
      transition: all 300ms ease;
    }

    .navbar.scrolled {
      background: rgba(11, 17, 32, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 16px 0;
    }

    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .navbar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .navbar-logo-mark {
      width: 32px;
      height: 32px;
    }

    .navbar-logo-mark svg {
      width: 100%;
      height: 100%;
    }

    .navbar-logo-text {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 400;
      color: var(--color-platinum-100);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* ========================================
       HERO SECTION
       ======================================== */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: 140px 0 100px;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse 80% 60% at 15% 20%, rgba(181, 146, 76, 0.04) 0%, transparent 60%),
        linear-gradient(135deg, transparent 40%, rgba(15, 23, 42, 0.5) 100%);
      pointer-events: none;
    }

    .hero::after {
      content: '';
      position: absolute;
      top: 40%;
      left: -50%;
      width: 200%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
      transform: rotate(-15deg);
    }

    .hero-grain {
      position: absolute;
      inset: 0;
      opacity: 0.35;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    }

    .hero-inner {
      display: grid;
      grid-template-columns: 55% 45%;
      gap: 60px;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .hero-content {
      max-width: 600px;
    }

    .hero-eyebrow {
      animation: fadeInLeft 600ms ease forwards;
      opacity: 0;
      margin-bottom: 24px;
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(48px, 5vw, 76px);
      font-weight: 300;
      line-height: 1.08;
      color: var(--color-platinum-100);
      margin-bottom: 28px;
      animation: fadeInUp 700ms ease 150ms forwards;
      opacity: 0;
    }

    .hero-subtitle {
      font-size: 18px;
      line-height: 1.7;
      color: var(--color-platinum-400);
      max-width: 480px;
      margin-bottom: 40px;
      animation: fadeInUp 700ms ease 300ms forwards;
      opacity: 0;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      margin-bottom: 48px;
      animation: fadeInUp 700ms ease 450ms forwards;
      opacity: 0;
    }

    .hero-trust {
      display: flex;
      gap: 32px;
      animation: fadeInUp 700ms ease 600ms forwards;
      opacity: 0;
    }

    .hero-trust-item {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--color-platinum-500);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hero-trust-item svg {
      width: 14px;
      height: 14px;
      color: var(--color-accent-muted);
    }

    .hero-visual {
      position: relative;
      animation: fadeInRight 800ms ease 200ms forwards;
      opacity: 0;
    }

    .hero-visual-bg {
      position: absolute;
      inset: -40px;
      overflow: hidden;
    }

    .hero-visual-bg::before,
    .hero-visual-bg::after {
      content: '';
      position: absolute;
      border: 1px solid rgba(181, 146, 76, 0.08);
      border-radius: 4px;
    }

    .hero-visual-bg::before {
      width: 300px;
      height: 200px;
      top: 20%;
      right: 10%;
      transform: rotate(-5deg);
    }

    .hero-visual-bg::after {
      width: 250px;
      height: 180px;
      bottom: 15%;
      left: 5%;
      transform: rotate(3deg);
      border-color: rgba(181, 146, 76, 0.05);
    }

    .hero-visual-line {
      position: absolute;
      background: rgba(181, 146, 76, 0.06);
    }

    .hero-visual-line-1 { width: 1px; height: 120px; top: 10%; left: 15%; }
    .hero-visual-line-2 { width: 80px; height: 1px; top: 30%; right: 5%; }
    .hero-visual-line-3 { width: 1px; height: 100px; bottom: 20%; right: 20%; }

    .dashboard-mock {
      background: var(--color-slate-800);
      border: 1px solid var(--color-slate-500);
      border-radius: 6px;
      padding: 28px;
      position: relative;
      animation: float 4s ease-in-out infinite;
      box-shadow: 
        0 0 0 1px rgba(255, 255, 255, 0.03) inset,
        0 20px 50px rgba(0, 0, 0, 0.4);
    }

    .dashboard-mock::before {
      content: '';
      position: absolute;
      top: 0;
      left: 20px;
      right: 20px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    }

    .dashboard-mock-label {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-platinum-500);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }

    .dashboard-mock-value {
      font-family: var(--font-mono);
      font-size: 36px;
      font-weight: 500;
      color: var(--color-platinum-100);
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }

    .dashboard-mock-chart {
      height: 60px;
      margin-bottom: 24px;
    }

    .dashboard-mock-chart svg {
      width: 100%;
      height: 100%;
    }

    .dashboard-mock-stats {
      display: flex;
      gap: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .dashboard-mock-stat {
      font-family: var(--font-mono);
      font-size: 13px;
    }

    .dashboard-mock-stat-positive { color: var(--color-positive); }
    .dashboard-mock-stat-neutral { color: var(--color-platinum-400); }

    /* ========================================
       STATS BAR
       ======================================== */
    .stats-bar {
      background: var(--color-slate-900);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 60px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }

    .stat-item {
      text-align: center;
      padding: 0 24px;
      position: relative;
    }

    .stat-item:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 48px;
      background: var(--color-slate-700);
    }

    .stat-number {
      font-family: var(--font-mono);
      font-size: 32px;
      font-weight: 500;
      color: var(--color-platinum-100);
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-platinum-500);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* ========================================
       FEATURES SECTION
       ======================================== */
    .features {
      padding: var(--section-padding) 0;
      background: var(--color-slate-950);
    }

    .features-header {
      text-align: center;
      margin-bottom: 72px;
    }

    .features-header .eyebrow { margin-bottom: 20px; }
    .features-header .section-title { margin-bottom: 16px; }
    .features-header .section-subtitle { margin: 0 auto; }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .feature-card {
      background: var(--color-slate-800);
      border: 1px solid var(--color-slate-600);
      border-radius: 6px;
      padding: 32px;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-accent);
      background: linear-gradient(135deg, var(--color-slate-800) 0%, rgba(181, 146, 76, 0.04) 100%);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 20px;
      color: var(--color-accent);
    }

    .feature-icon svg { width: 100%; height: 100%; }

    .feature-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--color-platinum-100);
      margin-bottom: 12px;
    }

    .feature-desc {
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-platinum-400);
    }

    /* ========================================
       PREVIEW SECTION
       ======================================== */
    .preview {
      padding: var(--section-padding) 0;
      background: var(--color-slate-900);
    }

    .preview-header {
      text-align: center;
      margin-bottom: 56px;
    }

    .preview-header-title {
      font-family: var(--font-display);
      font-size: 36px;
      font-weight: 300;
      font-style: italic;
      color: var(--color-platinum-200);
    }

    .preview-container {
      max-width: 1100px;
      margin: 0 auto;
      background: var(--color-slate-850);
      border: 1px solid var(--color-slate-600);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
    }

    .preview-navbar {
      background: var(--color-slate-800);
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .preview-navbar-dots {
      display: flex;
      gap: 8px;
    }

    .preview-navbar-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-slate-600);
    }

    .preview-navbar-dot:first-child { background: #ff5f57; }
    .preview-navbar-dot:nth-child(2) { background: #febc2e; }
    .preview-navbar-dot:last-child { background: #28c840; }

    .preview-body {
      display: grid;
      grid-template-columns: 200px 1fr;
      min-height: 400px;
    }

    .preview-sidebar {
      background: var(--color-slate-800);
      padding: 24px 16px;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
    }

    .preview-sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 4px;
      color: var(--color-platinum-400);
      font-size: 13px;
    }

    .preview-sidebar-item.active {
      background: var(--color-accent-subtle);
      color: var(--color-accent);
    }

    .preview-sidebar-icon {
      width: 16px;
      height: 16px;
      background: currentColor;
      border-radius: 2px;
      opacity: 0.5;
    }

    .preview-main {
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .preview-card {
      background: var(--color-slate-800);
      border: 1px solid var(--color-slate-600);
      border-radius: 6px;
      padding: 20px;
    }

    .preview-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .preview-card-title {
      font-size: 13px;
      color: var(--color-platinum-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .preview-card-value {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-positive);
    }

    .preview-chart {
      height: 120px;
    }

    .preview-chart svg { width: 100%; height: 100%; }

    /* ========================================
       FAQ SECTION
       ======================================== */
    .faq {
      padding: var(--section-padding) 0;
      background: var(--color-slate-950);
    }

    .faq-header {
      text-align: center;
      margin-bottom: 64px;
    }

    .faq-list {
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-item {
      border-bottom: 1px solid var(--color-slate-800);
    }

    .faq-question {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 28px 0;
      font-size: 17px;
      font-weight: 500;
      color: var(--color-platinum-200);
      text-align: left;
      cursor: pointer;
      transition: color 200ms ease;
    }

    .faq-question:hover {
      color: var(--color-platinum-100);
    }

    .faq-icon {
      width: 24px;
      height: 24px;
      color: var(--color-accent);
      flex-shrink: 0;
      transition: transform 300ms ease;
    }

    .faq-item.open .faq-icon {
      transform: rotate(45deg);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 300ms ease;
    }

    .faq-item.open .faq-answer {
      max-height: 300px;
    }

    .faq-answer-inner {
      padding-bottom: 28px;
      font-size: 15px;
      line-height: 1.7;
      color: var(--color-platinum-400);
    }

    /* ========================================
       CTA SECTION
       ======================================== */
    .cta {
      padding: var(--section-padding) 0 140px;
      background: linear-gradient(180deg, var(--color-slate-900) 0%, var(--color-slate-950) 100%);
      text-align: center;
    }

    .cta .eyebrow { margin-bottom: 24px; }
    .cta .section-title { font-size: 56px; margin-bottom: 20px; }
    .cta .section-subtitle { margin: 0 auto 48px; max-width: 520px; }

    .cta-button { margin-bottom: 24px; }

    .cta-login {
      font-size: 14px;
      color: var(--color-platinum-500);
    }

    .cta-login a {
      color: var(--color-accent);
      cursor: pointer;
      transition: color 200ms ease;
    }

    .cta-login a:hover {
      color: var(--color-accent-hover);
    }

    /* ========================================
       FOOTER
       ======================================== */
    .footer {
      background: var(--color-slate-950);
      border-top: 1px solid var(--color-slate-800);
      padding: 64px 0 32px;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }

    .footer-brand-text {
      font-size: 14px;
      color: var(--color-platinum-500);
      margin: 16px 0;
      max-width: 280px;
    }

    .footer-copyright {
      font-size: 13px;
      color: var(--color-platinum-500);
    }

    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .footer-links-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-platinum-400);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }

    .footer-links a {
      font-size: 14px;
      color: var(--color-platinum-500);
      cursor: pointer;
      transition: color 200ms ease;
    }

    .footer-links a:hover {
      color: var(--color-accent);
    }

    .footer-cta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .footer-bottom {
      padding-top: 32px;
      border-top: 1px solid var(--color-slate-800);
      text-align: center;
    }

    .footer-bottom-text {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-platinum-500);
      letter-spacing: 0.02em;
    }

    /* ========================================
       RESPONSIVE - TABLET
       ======================================== */
    @media (max-width: 1024px) {
      :host { --section-padding: 80px; }

      .hero-inner {
        grid-template-columns: 1fr;
        gap: 60px;
      }

      .hero-content {
        max-width: 100%;
        text-align: center;
      }

      .hero-subtitle {
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
      }

      .hero-actions { justify-content: center; }
      .hero-trust { justify-content: center; }

      .hero-visual {
        max-width: 500px;
        margin: 0 auto;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
      }

      .stat-item:nth-child(2)::after { display: none; }

      .features-grid { grid-template-columns: repeat(2, 1fr); }

      .preview-body { grid-template-columns: 1fr; }
      .preview-sidebar { display: none; }

      .footer-grid { grid-template-columns: 1fr 1fr; }
    }

    /* ========================================
       RESPONSIVE - MOBILE
       ======================================== */
    @media (max-width: 768px) {
      :host { --section-padding: 64px; }

      .navbar-actions .btn:first-child { display: none; }
      .navbar-actions .btn:last-child { padding: 0 20px; height: 40px; }

      .hero { padding: 120px 0 80px; }
      .hero-title { font-size: 40px; }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .hero-actions .btn {
        width: 100%;
        max-width: 300px;
      }

      .hero-trust {
        flex-direction: column;
        gap: 16px;
        align-items: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .stat-item::after { display: none !important; }

      .features-grid { grid-template-columns: 1fr; }
      .preview-main { grid-template-columns: 1fr; }
      .cta .section-title { font-size: 36px; }

      .footer-grid {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .footer-brand-text { margin-left: auto; margin-right: auto; }
      .footer-cta { align-items: center; }
    }

    @media (max-width: 480px) {
      .dashboard-mock-value { font-size: 28px; }
      .section-title { font-size: 36px; }
      .faq-question { font-size: 15px; }
    }
  `]
})
export class LandingComponent {
  isScrolled = false;

  faqItems = [
    {
      question: '¿Es necesario vincular mis cuentas bancarias?',
      answer: 'No. La plataforma funciona con introducción manual o importación de extractos. Nunca solicitamos acceso directo a sus entidades bancarias.',
      open: false
    },
    {
      question: '¿Quién puede ver mis datos financieros?',
      answer: 'Únicamente usted. Los datos se almacenan cifrados y no son accesibles por ningún tercero ni utilizados con fines publicitarios.',
      open: false
    },
    {
      question: '¿Qué formatos de extracto acepta la importación?',
      answer: 'Actualmente soportamos CSV, XLS y XLSX. Próximamente OFX y QIF.',
      open: false
    },
    {
      question: '¿Puedo gestionar varias cuentas de diferentes entidades?',
      answer: 'Sí. Puede añadir un número ilimitado de cuentas de cualquier entidad y visualizarlas de forma consolidada.',
      open: false
    },
    {
      question: '¿Existe versión móvil?',
      answer: 'La plataforma web es completamente responsiva. Una aplicación nativa está en desarrollo para iOS y Android.',
      open: false
    },
    {
      question: '¿Cuál es el coste del servicio?',
      answer: 'Actualmente en acceso anticipado. Regístrese para obtener acceso gratuito y ser informado de los planes futuros.',
      open: false
    }
  ];

  constructor(private router: Router) {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 50;
      });
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToFaq(): void {
    document.querySelector('.faq')?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleFaq(item: any): void {
    const wasOpen = item.open;
    this.faqItems.forEach(i => i.open = false);
    if (!wasOpen) {
      item.open = true;
    }
  }
}
