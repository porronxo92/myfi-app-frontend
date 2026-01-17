import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <p class="footer-text">
          © 2026 Develop by Ruben de la Cruz. All rights reserved.
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0;
      margin-top: auto;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .footer-text {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      opacity: 0.95;
      letter-spacing: 0.3px;
    }

    @media (max-width: 768px) {
      .footer-content {
        padding: 0 1rem;
        justify-content: center;
        text-align: center;
      }

      .footer-text {
        font-size: 0.8125rem;
      }
    }
  `]
})
export class FooterComponent {}
