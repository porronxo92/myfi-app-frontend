/**
 * Modelos para el procesamiento de extractos bancarios
 */

/**
 * Transacción procesada por la IA desde el extracto bancario
 */
export interface ProcessedTransaction {
  fecha: string;
  descripcion_original: string;
  descripcion_nlp: string;
  cantidad: number;
  tipo: 'expense' | 'income';
  categoria: string;
  metodo: string;
  notas: string | null;
  selected?: boolean;  // Para el checkbox de selección
}

/**
 * Resumen del período extraído del extracto
 */
export interface PeriodSummary {
  titular: string;
  mes: string;
  anio: string;
  periodo_completo: string;
  saldo_inicial: number;
  saldo_final: number;
  total_ingresos: number;
  total_gastos: number;
  total_transacciones: number;
}

/**
 * Metadatos del procesamiento de IA
 */
export interface UploadMetadata {
  total_transacciones: number;
  formato_origen: string;
  confianza_extraccion: string;
  advertencias: string[];
}

/**
 * Datos procesados del extracto bancario
 */
export interface UploadData {
  banco: string;
  resumen_periodo: PeriodSummary;
  transacciones: ProcessedTransaction[];
  metadatos: UploadMetadata;
}

/**
 * Respuesta del endpoint /api/upload/
 */
export interface UploadResponse {
  status: string;
  filename: string;
  data: UploadData;
}

/**
 * DTO para crear una transacción en el backend
 */
export interface CreateTransactionDto {
  date: string;
  amount: number;
  description: string;
  category_id?: string;  // Puede ser UUID o nombre de categoría
  type: 'expense' | 'income';
  notes?: string;
  tags?: string[];
  account_id: string;
}

// Tipos para el stepper
export type UploadStep = 'upload' | 'processing' | 'review';
