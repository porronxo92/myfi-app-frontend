import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { InvestmentService } from '../../core/services/investment.service';
import {
  UserPosition,
  EnrichedPosition,
  StockSearchResult,
  PortfolioSummary,
  InvestmentInsight,
  StockLogoResponse
} from '../../core/models/investment.model';
import { forkJoin } from 'rxjs';
import { FormatNumberPipe } from '../../shared/pipes/format-number.pipe';
import { StockLogoCacheService } from '../../shared/services/stock-logo-cache.service';

@Component({
  selector: 'app-investment',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, FormatNumberPipe],
  templateUrl: './investment.component.html',
  styleUrl: './investment.component.scss'
})
export class InvestmentComponent implements OnInit {
  private investmentService = inject(InvestmentService);
  private logoCacheService = inject(StockLogoCacheService);

  // State
  positions = signal<EnrichedPosition[]>([]);
  summary = signal<PortfolioSummary>({
    totalValue: 0,
    totalInvested: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    positionsCount: 0,
    cashBalance: 0,
    investedValue: 0
  });
  insights = signal<InvestmentInsight[]>([]);
  loading = signal<boolean>(true);
  searchQuery = signal<string>('');
  searchResults = signal<StockSearchResult[]>([]);
  searchLoading = signal<boolean>(false);
  showSearchResults = signal<boolean>(false);

  // Tab filter for active/sold positions
  selectedTab = signal<'active' | 'sold'>('active');

  // State para edición de cash balance
  editingCash = signal<boolean>(false);
  cashEditValue = signal<number>(0);
  savingCash = signal<boolean>(false);

  // Modal state para agregar inversión
  showAddModal = signal<boolean>(false);
  selectedStock = signal<StockSearchResult | null>(null);
  newPosition = signal({
    shares: 1,
    averagePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  // Modal state para vender posición
  showSellModal = signal<boolean>(false);
  positionToSell = signal<EnrichedPosition | null>(null);
  sellForm = signal({
    salePrice: 0,
    saleDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // State para edición inline
  editingPosition = signal<string | null>(null);
  editForm = signal({
    shares: 0,
    averagePrice: 0
  });

  // State para logos de stocks
  stockLogos = signal<Map<string, string>>(new Map());

  // State para ordenamiento de tabla
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Computed para posiciones ordenadas
  sortedPositions = computed(() => {
    const positions = [...this.positions()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    if (!column) return positions;

    return positions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (column) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'currentPrice':
          aValue = a.currentPrice;
          bValue = b.currentPrice;
          break;
        case 'changePercent':
          aValue = a.changePercent;
          bValue = b.changePercent;
          break;
        case 'shares':
          aValue = a.shares;
          bValue = b.shares;
          break;
        case 'totalValue':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'totalGainLoss':
          aValue = a.totalGainLoss;
          bValue = b.totalGainLoss;
          break;
        case 'totalGainLossPercent':
          aValue = a.totalGainLossPercent;
          bValue = b.totalGainLossPercent;
          break;
        case 'weight':
          aValue = parseFloat(this.calculatePortfolioWeight(a));
          bValue = parseFloat(this.calculatePortfolioWeight(b));
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return direction === 'asc' 
        ? (aValue - bValue)
        : (bValue - aValue);
    });
  });

  ngOnInit(): void {
    this.loadPositions();
  }

  /**
   * Cargar todas las posiciones del usuario (ahora el backend retorna todo calculado)
   */
  loadPositions(): void {
    this.loading.set(true);
    const status = this.selectedTab();
    this.investmentService.getInvestmentsWithSummary(status).subscribe({
      next: (data) => {
        this.positions.set(data.positions);
        this.summary.set(data.summary);
        this.insights.set(data.insights);
        this.loading.set(false);
        
        // Cargar logos para todas las posiciones
        this.loadStockLogos(data.positions);
      },
      error: () => {
        console.error('Error loading investments');
        this.loading.set(false);
      }
    });
  }

  /**
   * Cambiar entre tabs active/sold
   */
  changeTab(tab: 'active' | 'sold'): void {
    this.selectedTab.set(tab);
    this.loadPositions();
  }

  /**
   * Cargar logos de stocks para todas las posiciones
   */
  loadStockLogos(positions: EnrichedPosition[]): void {
    if (positions.length === 0) return;

    const logos = new Map<string, string>();
    const tickersToFetch: string[] = [];

    // Revisar caché primero
    positions.forEach(position => {
      const cachedUrl = this.logoCacheService.get(position.symbol);
      if (cachedUrl) {
        logos.set(position.symbol, cachedUrl);
      } else {
        tickersToFetch.push(position.symbol);
      }
    });

    // Actualizar con logos en caché inmediatamente
    if (logos.size > 0) {
      this.stockLogos.set(logos);
    }

    // Si no hay tickers para fetch, terminar
    if (tickersToFetch.length === 0) {
      return;
    }

    // Fetch logos que no están en caché
    const logoRequests = tickersToFetch.map(ticker => 
      this.investmentService.getStockLogo(ticker)
    );

    forkJoin(logoRequests).subscribe({
      next: (responses: StockLogoResponse[]) => {
        const updatedLogos = new Map(logos); // Copiar logos existentes
        
        responses.forEach(response => {
          if (response.available && response.logo_url) {
            updatedLogos.set(response.ticker, response.logo_url);
            // Guardar en caché
            this.logoCacheService.set(response.ticker, response.logo_url);
          }
        });
        
        this.stockLogos.set(updatedLogos);
      },
      error: () => {
        console.error('Error loading stock logos');
      }
    });
  }

  /**
   * Obtener URL del logo para un ticker
   */
  getLogoUrl(ticker: string): string | null {
    return this.stockLogos().get(ticker) || null;
  }

  /**
   * Ordenar tabla por columna
   */
  sortBy(column: string): void {
    if (this.sortColumn() === column) {
      // Cambiar dirección si es la misma columna
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Nueva columna, empezar con ascendente
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  /**
   * Obtener ícono de ordenamiento para una columna
   */
  getSortIcon(column: string): string {
    if (this.sortColumn() !== column) return '⇅';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  /**
   * Buscar ticker cuando el usuario pulse el botón de búsqueda
   * Solo se ejecuta cuando el usuario lo solicita explícitamente
   */
  searchStock(): void {
    const query = this.searchQuery();
    
    if (query.length < 1) {
      return;
    }

    this.searchLoading.set(true);
    this.showSearchResults.set(false); // Ocultar resultados previos

    this.investmentService.searchStocks(query).subscribe({
      next: (results) => {
        // Esperar al menos 1 segundo antes de mostrar resultados
        setTimeout(() => {
          this.searchResults.set(results);
          this.searchLoading.set(false);
          this.showSearchResults.set(true);
        }, 1000);
      },
      error: () => {
        console.error('Error searching stocks');
        setTimeout(() => {
          this.searchLoading.set(false);
          this.searchResults.set([]);
          this.showSearchResults.set(true);
        }, 1000);
      }
    });
  }

  /**
   * Seleccionar una acción de los resultados de búsqueda
   */
  selectStock(stock: StockSearchResult): void {
    this.selectedStock.set(stock);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showSearchResults.set(false);
    this.showAddModal.set(true);

    // El backend ya tiene la cotización actual, solo necesitamos prellenar el formulario
    // En una mejora futura podríamos obtener el precio actual del backend
    this.newPosition.update(pos => ({
      ...pos,
      averagePrice: 0 // El usuario debe ingresar el precio de compra
    }));
  }

  /**
   * Limpiar la selección y volver a la búsqueda
   */
  clearSelection(): void {
    this.selectedStock.set(null);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showSearchResults.set(false);
    this.newPosition.set({
      shares: 0,
      averagePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  }

  /**
   * Actualizar un campo específico de newPosition
   */
  updateNewPosition(field: 'shares' | 'averagePrice' | 'purchaseDate', value: any): void {
    this.newPosition.update(pos => ({
      ...pos,
      [field]: value
    }));
  }

  /**
   * Agregar nueva posición
   */
  addPosition(): void {
    const stock = this.selectedStock();
    if (!stock) return;

    const position = this.newPosition();
    
    this.investmentService.addPosition({
      symbol: stock.symbol,
      companyName: stock.name,
      shares: position.shares,
      averagePrice: position.averagePrice,
      purchaseDate: position.purchaseDate
    }).subscribe({
      next: () => {
        this.showAddModal.set(false);
        this.resetNewPosition();
        this.loadPositions(); // Recargar todo
      },
      error: () => {
        console.error('Error adding position');
        alert('Error al agregar la inversión. Por favor intenta de nuevo.');
      }
    });
  }

  /**
   * Abrir modal de venta
   */
  openSellModal(position: EnrichedPosition): void {
    this.positionToSell.set(position);
    this.sellForm.set({
      salePrice: position.currentPrice, // Prellenar con precio actual
      saleDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    this.showSellModal.set(true);
  }

  /**
   * Cerrar modal de venta
   */
  closeSellModal(): void {
    this.showSellModal.set(false);
    this.positionToSell.set(null);
    this.sellForm.set({
      salePrice: 0,
      saleDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  }

  /**
   * Actualizar un campo específico de sellForm
   */
  updateSellForm(field: 'salePrice' | 'saleDate' | 'notes', value: any): void {
    this.sellForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  /**
   * Confirmar venta de posición
   */
  confirmSell(): void {
    const position = this.positionToSell();
    const form = this.sellForm();
    
    if (!position?.id || form.salePrice <= 0) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    this.investmentService.sellPosition(
      position.id,
      form.salePrice,
      form.saleDate,
      form.notes
    ).subscribe({
      next: () => {
        this.closeSellModal();
        this.loadPositions(); // Recargar posiciones (ya no aparecerá la vendida)
      },
      error: () => {
        console.error('Error selling position');
        alert('Error al vender la posición. Por favor intenta de nuevo.');
      }
    });
  }

  /**
   * Eliminar posición permanentemente
   */
  deletePosition(position: EnrichedPosition): void {
    if (!position.id) return;
    
    if (!confirm(`¿Estás seguro de eliminar la posición de ${position.companyName}?`)) {
      return;
    }

    this.investmentService.deletePosition(position.id).subscribe({
      next: () => {
        this.loadPositions();
      },
      error: () => {
        console.error('Error deleting position');
        alert('Error al eliminar la posición.');
      }
    });
  }

  /**
   * Iniciar edición de una posición
   */
  startEdit(position: EnrichedPosition): void {
    this.editingPosition.set(position.id || null);
    this.editForm.set({
      shares: position.shares,
      averagePrice: position.averagePrice
    });
  }

  /**
   * Cancelar edición
   */
  cancelEdit(): void {
    this.editingPosition.set(null);
    this.editForm.set({
      shares: 0,
      averagePrice: 0
    });
  }

  /**
   * Guardar cambios de edición
   */
  savePosition(position: EnrichedPosition): void {
    if (!position.id) return;

    const form = this.editForm();
    
    if (form.shares <= 0 || form.averagePrice <= 0) {
      alert('Las acciones y el precio deben ser mayores que 0');
      return;
    }

    this.investmentService.updatePosition(position.id, {
      shares: form.shares,
      averagePrice: form.averagePrice
    }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadPositions();
      },
      error: () => {
        console.error('Error updating position');
        alert('Error al actualizar la posición.');
      }
    });
  }

  /**
   * Calcular el peso de una posición en la cartera (%)
   */
  calculatePortfolioWeight(position: EnrichedPosition): string {
    const totalValue = this.summary().totalValue;
    if (!totalValue || totalValue === 0) return '0.00';

    const weight = (position.totalValue / totalValue) * 100;
    return weight.toFixed(2);
  }

  /**
   * Calcular el peso del cash en la cartera (%)
   */
  calculateCashWeight(): string {
    const totalValue = this.summary().totalValue;
    const cash = this.summary().cashBalance;
    if (!totalValue || totalValue === 0) return '0.00';
    return ((cash / totalValue) * 100).toFixed(2);
  }

  /**
   * Iniciar edición del cash balance
   */
  startEditCash(): void {
    this.cashEditValue.set(this.summary().cashBalance);
    this.editingCash.set(true);
  }

  /**
   * Cancelar edición del cash
   */
  cancelEditCash(): void {
    this.editingCash.set(false);
    this.cashEditValue.set(0);
  }

  /**
   * Guardar cambios de cash balance
   */
  saveCashBalance(): void {
    const newCash = this.cashEditValue();
    if (newCash < 0) {
      alert('El efectivo no puede ser negativo');
      return;
    }

    this.savingCash.set(true);
    this.investmentService.updateCashBalance(newCash).subscribe({
      next: () => {
        this.editingCash.set(false);
        this.savingCash.set(false);
        this.loadPositions();
      },
      error: () => {
        console.error('Error updating cash balance');
        alert('Error al actualizar el efectivo');
        this.savingCash.set(false);
      }
    });
  }

  /**
   * Cerrar modal de agregar inversión
   */
  closeAddModal(): void {
    this.showAddModal.set(false);
    this.resetNewPosition();
  }

  /**
   * Resetear formulario de nueva posición
   */
  private resetNewPosition(): void {
    this.selectedStock.set(null);
    this.newPosition.set({
      shares: 1,
      averagePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  }

  /**
   * Cerrar resultados de búsqueda al hacer click fuera
   */
  closeSearchResults(): void {
    setTimeout(() => this.showSearchResults.set(false), 200);
  }

  /**
   * Formatear moneda
   */
  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Formatear porcentaje
   */
  formatPercent(value: number | undefined): string {
    if (value === undefined || value === null) return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  /**
   * Clase CSS basada en si es positivo o negativo
   */
  getValueClass(value: number | undefined): string {
    if (value === undefined || value === null) return '';
    return value >= 0 ? 'positive' : 'negative';
  }

  /**
   * Ícono de tendencia
   */
  getTrendIcon(value: number): string {
    return value >= 0 ? '▲' : '▼';
  }
}
