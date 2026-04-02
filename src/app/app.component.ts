import { Component, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { InactivityTimeoutService } from './core/services/inactivity-timeout.service';
import { InactivityWarningModalComponent } from './shared/components/inactivity-warning-modal.component';
import { GlobalChatComponent } from './shared/components/global-chat/global-chat.component';

/**
 * Componente principal de la aplicación
 * 
 * Responsabilidades:
 * - Gestionar el router outlet
 * - Iniciar/detener monitoreo de inactividad según estado de autenticación
 * - Mostrar modal de advertencia de timeout
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    InactivityWarningModalComponent,
    GlobalChatComponent
  ],
  template: `
    <router-outlet></router-outlet>

    <!-- Modal de advertencia de timeout por inactividad -->
    <app-inactivity-warning-modal />

    <!-- Chat global flotante (disponible en todas las páginas) -->
    <app-global-chat />
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Finanzas Personal - MVP';

  constructor(
    private authService: AuthService,
    private inactivityService: InactivityTimeoutService,
    private themeService: ThemeService
  ) {
    // Inicializar el tema al arrancar la aplicación
    this.themeService.init();

    // Monitorear cambios en el estado de autenticación
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      
      if (isAuthenticated) {
        this.inactivityService.startMonitoring();
      } else {
        this.inactivityService.stopMonitoring();
      }
    });
  }

  ngOnInit(): void {
    // El monitoreo se inicia automáticamente mediante el effect cuando hay autenticación
  }
}
