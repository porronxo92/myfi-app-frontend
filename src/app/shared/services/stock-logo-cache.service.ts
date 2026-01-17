import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Servicio de caché para logos de stocks
 * Almacena los logos en localStorage para evitar múltiples descargas
 */
@Injectable({
  providedIn: 'root'
})
export class StockLogoCacheService {
  private readonly CACHE_KEY = 'stock_logos_cache';
  private readonly CACHE_EXPIRY_DAYS = 7; // Logos expiran después de 7 días
  private memoryCache: Map<string, string> = new Map();

  constructor() {
    this.loadCacheFromStorage();
  }

  /**
   * Obtener logo desde caché
   */
  get(ticker: string): string | null {
    // Primero revisar memoria
    if (this.memoryCache.has(ticker)) {
      return this.memoryCache.get(ticker)!;
    }

    // Revisar localStorage
    const cache = this.getCache();
    const cached = cache[ticker];

    if (cached && !this.isExpired(cached.timestamp)) {
      // Actualizar memoria caché
      this.memoryCache.set(ticker, cached.url);
      return cached.url;
    }

    return null;
  }

  /**
   * Guardar logo en caché
   */
  set(ticker: string, url: string): void {
    // Guardar en memoria
    this.memoryCache.set(ticker, url);

    // Guardar en localStorage
    const cache = this.getCache();
    cache[ticker] = {
      url: url,
      timestamp: Date.now()
    };
    this.saveCache(cache);
  }

  /**
   * Verificar si un logo está en caché y es válido
   */
  has(ticker: string): boolean {
    return this.get(ticker) !== null;
  }

  /**
   * Limpiar caché expirado
   */
  cleanExpiredCache(): void {
    const cache = this.getCache();
    const cleaned: any = {};
    let hasChanges = false;

    Object.keys(cache).forEach(ticker => {
      if (!this.isExpired(cache[ticker].timestamp)) {
        cleaned[ticker] = cache[ticker];
      } else {
        hasChanges = true;
        this.memoryCache.delete(ticker);
      }
    });

    if (hasChanges) {
      this.saveCache(cleaned);
    }
  }

  /**
   * Limpiar toda la caché
   */
  clearAll(): void {
    this.memoryCache.clear();
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Obtener tamaño de la caché
   */
  getCacheSize(): number {
    return this.memoryCache.size;
  }

  /**
   * Obtener estadísticas de caché
   */
  getStats(): { size: number; items: string[] } {
    return {
      size: this.memoryCache.size,
      items: Array.from(this.memoryCache.keys())
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private getCache(): any {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('Error loading cache:', error);
      return {};
    }
  }

  private saveCache(cache: any): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving cache:', error);
      // Si falla por espacio, limpiar caché antigua
      this.clearAll();
    }
  }

  private loadCacheFromStorage(): void {
    const cache = this.getCache();
    Object.keys(cache).forEach(ticker => {
      if (!this.isExpired(cache[ticker].timestamp)) {
        this.memoryCache.set(ticker, cache[ticker].url);
      }
    });

    // Limpiar caché expirado al iniciar
    this.cleanExpiredCache();
  }

  private isExpired(timestamp: number): boolean {
    const expiryTime = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > expiryTime;
  }
}
