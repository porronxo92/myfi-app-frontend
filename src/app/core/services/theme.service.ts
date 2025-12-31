import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Cargar tema guardado en localStorage al iniciar (sincronicamente)
    this.loadTheme();
    
    // Aplicar tema al body inmediatamente
    this.applyThemeToBody();

    // Efecto para sincronizar cambios del signal con el DOM
    effect(() => {
      this.applyThemeToBody();
    });
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme !== null) {
      const isDark = savedTheme === 'dark';
      this.isDarkMode.set(isDark);
    }
  }

  private applyThemeToBody(): void {
    if (this.isDarkMode()) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update(dark => !dark);
    this.saveTheme();
  }

  private saveTheme(): void {
    const theme = this.isDarkMode() ? 'dark' : 'light';
    localStorage.setItem(this.THEME_KEY, theme);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    this.saveTheme();
  }
}
