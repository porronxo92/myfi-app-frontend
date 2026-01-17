/**
 * Investment Models - Modelos para el módulo de inversiones bursátiles
 */

/**
 * Información de una acción obtenida de la API bursátil
 */
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  currency: string;
  timestamp: Date;
}

/**
 * Resultado de búsqueda de acciones
 */
export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

/**
 * Posición del usuario en una acción específica
 */
export interface UserPosition {
  id?: string; // UUID
  userId?: string; // UUID
  symbol: string;
  companyName: string;
  shares: number; // Cantidad de acciones
  averagePrice: number; // Precio promedio de compra
  purchaseDate: Date;
  status?: 'active' | 'sold' | 'watchlist';
  salePrice?: number;
  saleDate?: Date;
  notes?: string;
}

/**
 * Posición con datos de mercado actuales (combinación de UserPosition + StockQuote)
 */
export interface EnrichedPosition extends UserPosition {
  currentPrice: number;
  changePercent: number;
  totalValue: number; // shares * currentPrice
  totalGainLoss: number; // (currentPrice - averagePrice) * shares
  totalGainLossPercent: number; // ((currentPrice - averagePrice) / averagePrice) * 100
  dayChange: number; // Cambio del día en $
}

/**
 * Resumen del portfolio completo
 */
export interface PortfolioSummary {
  totalValue: number; // Suma de todos los totalValue
  totalInvested: number; // Suma de (averagePrice * shares)
  totalGainLoss: number; // totalValue - totalInvested
  totalGainLossPercent: number; // (totalGainLoss / totalInvested) * 100
  dayChange: number; // Cambio total del día
  dayChangePercent: number;
  positionsCount: number;
}

/**
 * Diversificación por sector (para insights)
 */
export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

/**
 * Insight o recomendación
 */
export interface InvestmentInsight {
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  message: string;
  icon: string;
}

/**
 * Request para agregar nueva posición
 */
export interface AddPositionRequest {
  symbol: string;
  companyName: string;
  shares: number;
  averagePrice: number;
  purchaseDate: string; // ISO format
  notes?: string;
}

/**
 * Request para actualizar posición existente
 */
export interface UpdatePositionRequest {
  shares?: number;
  averagePrice?: number;
  notes?: string;
}

/**
 * Respuesta del endpoint de logos de stocks
 */
export interface StockLogoResponse {
  ticker: string;
  logo_url: string | null;
  available: boolean;
  content_type?: string;
  message?: string;
}
