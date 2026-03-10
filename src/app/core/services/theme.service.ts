import { Injectable, signal, effect, computed } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: Theme = 'dark';

/**
 * ThemeService - Institutional Theme System
 * 
 * Manages light/dark theme switching with:
 * - localStorage persistence
 * - DOM data-theme attribute updates
 * - Reactive signals for components
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = STORAGE_KEY;
  
  /** Current theme signal - reactive */
  readonly currentTheme = signal<Theme>(this.getStoredTheme());
  
  /** Legacy compatibility */
  readonly isDarkMode = computed(() => this.currentTheme() === 'dark');

  /** Computed: is dark mode active */
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  /** Computed: is light mode active */
  readonly isLight = computed(() => this.currentTheme() === 'light');

  constructor() {
    // Apply theme immediately on construction
    this.applyTheme(this.currentTheme());
    
    // Sync DOM attribute whenever theme changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.persistTheme(theme);
    });
  }

  /**
   * Initialize theme on app bootstrap
   */
  init(): void {
    const theme = this.getStoredTheme();
    this.currentTheme.set(theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggle(): void {
    const newTheme: Theme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
  }

  /** Legacy compatibility */
  toggleTheme(): void {
    this.toggle();
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /** Legacy compatibility */
  setDarkMode(isDark: boolean): void {
    this.setTheme(isDark ? 'dark' : 'light');
  }

  /**
   * Get the current theme value
   */
  getCurrentTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Get the aria-label for accessibility
   */
  getToggleAriaLabel(): string {
    return this.currentTheme() === 'dark' 
      ? 'Cambiar a modo claro' 
      : 'Cambiar a modo oscuro';
  }

  /**
   * Read theme from localStorage
   */
  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return DEFAULT_THEME;
  }

  /**
   * Persist theme to localStorage
   */
  private persistTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Apply theme to DOM via data-theme attribute on <html>
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
  }
}
