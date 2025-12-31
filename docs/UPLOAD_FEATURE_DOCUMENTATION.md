# Documentación: Funcionalidad de Carga de Extractos Bancarios

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Flujo de Datos](#flujo-de-datos)
3. [Estructura de Componentes](#estructura-de-componentes)
4. [Modelos de Datos](#modelos-de-datos)
5. [Servicios Utilizados](#servicios-utilizados)
6. [Funciones de Utilidad](#funciones-de-utilidad)
7. [Manejo de Errores](#manejo-de-errores)
8. [Interfaz de Usuario](#interfaz-de-usuario)

---

## 📖 Descripción General

La funcionalidad de **carga de extractos bancarios** permite a los usuarios:
1. Subir archivos PDF, CSV, XLSX o TXT de extractos bancarios
2. Procesarlos automáticamente con IA (Gemini)
3. Revisar y validar las transacciones detectadas
4. Guardarlas masivamente en la base de datos asociadas a una cuenta bancaria

### Ruta de acceso
- **URL**: `/transactions/upload`
- **Protección**: Requiere autenticación (`authGuard`)

---

## 🔄 Flujo de Datos

### 1. Carga del Archivo (Upload)
```
Usuario selecciona archivo
  ↓
FileUploadZoneComponent valida extensión y tamaño
  ↓
UploadStatementComponent almacena file en signal
  ↓
Usuario hace clic en "Procesar extracto"
```

### 2. Procesamiento con IA
```
startProcessing() se ejecuta
  ↓
UploadService.uploadStatement(file) → POST /api/upload/
  ↓
Backend procesa con Gemini AI
  ↓
Respuesta JSON con transacciones estructuradas
  ↓
uploadResponse signal se actualiza
  ↓
Paso cambia a 'review'
```

### 3. Revisión y Validación
```
Usuario revisa transacciones en tabla
  ↓
Selecciona/deselecciona transacciones con checkbox
  ↓
Selecciona cuenta bancaria obligatoria
  ↓
Hace clic en "Guardar N transacciones"
  ↓
Modal de confirmación
```

### 4. Guardado Masivo
```
confirmSaveTransactions() se ejecuta
  ↓
Filtra transacciones seleccionadas
  ↓
Por cada transacción:
  - Convierte a CreateTransactionDto
  - POST /api/transactions
  - Actualiza progreso
  ↓
Muestra resultado final
  ↓
Resetea el formulario
```

---

## 🏗️ Estructura de Componentes

### UploadStatementComponent
**Ubicación**: `frontend/src/app/features/transactions/upload-statement.component.ts`

#### Signals principales
```typescript
currentStep: Signal<UploadStep>  // 'upload' | 'processing' | 'review'
selectedFile: Signal<File | null>
uploadResponse: Signal<UploadResponse | null>
selectedAccountId: string | null
accounts: Signal<Account[]>
showConfirmModal: Signal<boolean>
isSaving: Signal<boolean>
savingProgress: Signal<number>
```

#### Computed Signals
```typescript
transactions()  // Transacciones con propiedad 'selected'
selectedCount()  // Número de transacciones seleccionadas
allSelected()  // Booleano si todas están seleccionadas
canSaveTransactions()  // Validación antes de guardar
```

#### Métodos principales
| Método | Descripción |
|--------|-------------|
| `onFileSelected(file)` | Almacena archivo seleccionado |
| `startProcessing()` | Envía archivo al backend para procesamiento |
| `saveTransactions()` | Abre modal de confirmación |
| `confirmSaveTransactions()` | Guarda transacciones secuencialmente |
| `toggleSelectAll()` | Selecciona/deselecciona todas las transacciones |
| `discardAndReset()` | Descarta y vuelve al paso 1 |
| `resetState()` | Limpia todos los signals y vuelve a `/transactions` |

---

### FileUploadZoneComponent
**Ubicación**: `frontend/src/app/shared/components/file-upload-zone.component.ts`

Componente reutilizable para drag & drop con:
- Validación de extensiones (pdf, csv, xlsx, txt)
- Validación de tamaño (máx. 10 MB)
- Estados visuales (default, dragging, has-file, error)
- Output: `fileSelected` emite el File seleccionado

---

## 📦 Modelos de Datos

### ProcessedTransaction
```typescript
interface ProcessedTransaction {
  fecha: string;                    // ISO 8601 date
  descripcion_original: string;      // Texto raw del extracto
  descripcion_nlp: string;           // Descripción procesada por IA
  cantidad: number;                  // Importe (positivo o negativo)
  tipo: 'expense' | 'income';        // Tipo de transacción
  categoria: string;                 // Categoría asignada por IA
  metodo: string;                    // Método de detección ('automatico')
  notas: string | null;              // Notas adicionales
  selected?: boolean;                // Para checkbox de selección
}
```

### UploadResponse (Respuesta del Backend)
```typescript
interface UploadResponse {
  status: string;                    // 'success'
  filename: string;                  // 'febrero25.pdf'
  data: {
    banco: string;                   // 'Bankinter'
    resumen_periodo: {
      titular: string;
      mes: string;
      anio: string;
      periodo_completo: string;
      saldo_inicial: number;
      saldo_final: number;
      total_ingresos: number;
      total_gastos: number;
      total_transacciones: number;
    };
    transacciones: ProcessedTransaction[];
    metadatos: {
      total_transacciones: number;
      formato_origen: string;        // 'imagen' | 'pdf' | 'csv'
      confianza_extraccion: string;  // 'alta' | 'media' | 'baja'
      advertencias: string[];        // Mensajes de IA
    };
  };
}
```

### CreateTransactionDto (Payload al guardar)
```typescript
interface CreateTransactionDto {
  date: string;          // fecha de ProcessedTransaction
  amount: number;        // Math.abs(cantidad)
  description: string;   // descripcion_nlp
  category: string;      // categoria
  type: 'expense' | 'income';
  notes: string;         // notas || ''
  tags: string[];        // []
  account_id: string;    // ID de cuenta seleccionada
}
```

---

## 🛠️ Servicios Utilizados

### UploadService
**Método principal**: `uploadStatement(file: File): Observable<UploadResponse>`
- Crea FormData con campo 'fichero'
- POST a `/api/upload/`
- Incluye `withCredentials: true` para cookies HTTP-only

**Métodos auxiliares**:
- `validateFile(file)`: Valida extensión y tamaño
- `formatFileSize(bytes)`: Formatea tamaño (ej: "2.5 MB")

### AccountService
- `getAccounts()`: Obtiene cuentas del usuario para el selector

### TransactionService
- `createTransaction(dto: CreateTransactionDto)`: Crea transacción individual
- Usado en bucle para guardado masivo

---

## 🔧 Funciones de Utilidad

### formatCurrency(amount: number): string
```typescript
new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR'
}).format(amount);
// Ejemplo: 1234.56 → "1.234,56 €"
```

### formatDate(dateString: string): string
```typescript
new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(new Date(dateString));
// Ejemplo: "2025-02-15" → "15/02/2025"
```

### getSelectedAccountName(): string
- Busca cuenta por `selectedAccountId`
- Retorna `account.account_name` o string vacío

---

## ⚠️ Manejo de Errores

### Durante la carga del archivo
```typescript
startProcessing() {
  this.uploadService.uploadStatement(file).subscribe({
    next: (response) => {
      // Procesar respuesta exitosa
    },
    error: (error) => {
      alert('Error al procesar el extracto: ' + error.message);
      this.currentStep.set('upload');  // Volver al paso 1
    }
  });
}
```

### Durante el guardado de transacciones
```typescript
// Si una transacción falla, se continúa con la siguiente
saveNext(index + 1);  // No se detiene el proceso

// Al finalizar:
alert(`✅ ${savedCount} transacciones guardadas correctamente`);
```

### Validaciones antes de guardar
1. **Cuenta obligatoria**: `selectedAccountId !== null`
2. **Al menos 1 transacción seleccionada**: `selectedCount() > 0`
3. **Botón deshabilitado si no cumple**: `canSaveTransactions()`

---

## 🎨 Interfaz de Usuario

### Paso 1: Carga
- **FileUploadZoneComponent** con drag & drop
- **Validación en tiempo real** (extensión, tamaño)
- **Botones**: "Cancelar" | "Procesar extracto"

### Paso 2: Procesamiento
- **Spinner animado** (CSS animation)
- **Mensaje informativo**: "Procesando extracto con IA..."
- **Información del archivo**: nombre con icono

### Paso 3: Revisión

#### Panel Lateral (320px fijo)
1. **Card Resumen del Período**
   - Nombre del banco (con icono)
   - Período completo (mes y año)
   - Titular
   - Total Ingresos (verde)
   - Total Gastos (rojo)
   - Balance (azul, destacado)
   - Total transacciones procesadas

2. **Card Advertencias** (solo si existen)
   - Lista de advertencias de IA
   - Borde naranja, fondo amarillo claro

3. **Card Cuenta Destino** (obligatorio)
   - Dropdown con todas las cuentas del usuario
   - Mensaje de error si no se selecciona

#### Área Principal (tabla responsive)
**Columnas**:
- ☑️ Checkbox (selección individual)
- 📅 Fecha (DD/MM/YYYY)
- 📝 Concepto (descripción_nlp + descripción_original en gris)
- 🏷️ Categoría (badge con color)
- 💰 Importe (verde si income, rojo si expense)
- 🔖 Tipo (badge "Ingreso" o "Gasto")

**Acciones**:
- **"Seleccionar todos"**: Toggle masivo
- **Contador**: "X de Y seleccionadas"

#### Footer
- **Botón "Descartar"**: Cancela y vuelve a `/transactions`
- **Botón "Guardar N transacciones"**:
  - Deshabilitado si no hay cuenta o no hay seleccionadas
  - Abre modal de confirmación

---

### Modal de Confirmación
- **Título**: "Confirmar guardado"
- **Mensaje**: Cantidad de transacciones + nombre de cuenta
- **Acciones**: "Cancelar" | "Confirmar y guardar"

### Modal de Guardado en Progreso
- **Spinner animado**
- **Título**: "Guardando transacciones..."
- **Progreso**: "X de Y transacciones guardadas"
- **Barra de progreso visual**

---

## 🎯 Características Destacadas

### ✅ Implementadas
- [x] Parseo completo de respuesta JSON del backend
- [x] Visualización estructurada de datos (sidebar + tabla)
- [x] Selección masiva de transacciones
- [x] Selector de cuenta obligatorio
- [x] Advertencias de IA visibles
- [x] Guardado secuencial con progreso
- [x] Modal de confirmación
- [x] Formateo de moneda y fechas localizado (es-ES)
- [x] Diseño responsive
- [x] Manejo de errores robusto

### 🎨 Estilos
- **Design System**: Coherente con el resto de la aplicación
- **Colores**:
  - Ingresos: Verde (#10b981)
  - Gastos: Rojo (#ef4444)
  - Primario: Azul (#3b82f6)
  - Advertencias: Naranja (#f59e0b)
- **Tipografía**: Tomorrow (font principal del proyecto)

---

## 🔗 Endpoints Integrados

1. **POST /api/upload/**
   - Input: FormData con campo 'fichero'
   - Output: UploadResponse

2. **GET /api/accounts/**
   - Output: Array<Account>

3. **POST /api/transactions/**
   - Input: CreateTransactionDto
   - Output: Transaction creada

---

## 🚀 Mejoras Futuras Sugeridas

1. **Edición inline de categorías**: Dropdown en la tabla
2. **Filtros avanzados**: Por tipo, categoría, rango de fechas
3. **Duplicados detectados**: Marcar transacciones ya existentes
4. **Importación parcial**: Guardar solo seleccionadas sin confirmar todas
5. **Historial de uploads**: Ver extractos procesados anteriormente
6. **Exportar a CSV**: Descargar transacciones procesadas

---

## 📚 Referencias

- **Componente Principal**: [upload-statement.component.ts](src/app/features/transactions/upload-statement.component.ts)
- **Modelos**: [upload.model.ts](src/app/core/models/upload.model.ts)
- **Servicio**: [upload.service.ts](src/app/core/services/upload.service.ts)
- **Ruta**: [app.routes.ts](src/app/app.routes.ts) → `/transactions/upload`

---

**Fecha de última actualización**: 31 de diciembre de 2025
**Versión**: 2.0.0

---

## 🆕 Historial de Cambios

### Versión 2.0.0 (31/12/2025)

#### 1. Reestructuración del Panel Lateral
- **ELIMINADO**: Componente `bank-name` del sidebar
- **REORDENADO**: Selector de cuenta movido a la parte superior del aside
- **AÑADIDO**: Texto descriptivo "Elige la cuenta destino donde se cargarán estas transacciones"
- **MEJORADO**: Mejor jerarquía visual de la información

#### 2. Corrección del Account-Select
- **SOLUCIONADO**: Bug de visualización de nombres de cuenta
- **CORREGIDO**: Renderizado correcto de `account.account_name` en las opciones
- **VERIFICADO**: El `value` del select captura correctamente el `account.id`
- **CRÍTICO**: Este ID se usa posteriormente para el guardado de transacciones

#### 3. Implementación de Paginación
- **AÑADIDO**: Sistema de paginación client-side
- **CONFIGURACIÓN**: Máximo 10 transacciones por página
- **CONTROLES**:
  - Botón "Anterior" (deshabilitado en página 1)
  - Indicador: "Página X de Y"
  - Botón "Siguiente" (deshabilitado en última página)
- **OPTIMIZACIÓN**: Sin peticiones al servidor, paginación en memoria
- **ESTADO**: Se mantiene la página actual al interactuar con otros elementos

#### 4. Editor de Categorías para "Sin Categorizar"
- **FUNCIONALIDAD**: Modal de edición para transacciones sin categorizar
- **TRIGGER**: Click en badge de categoría "Sin Categorizar"
- **ENDPOINT**: GET `/api/categories/available/all?type={tipo}`
  - `tipo=expense` para gastos
  - `tipo=income` para ingresos
- **FLUJO**:
  1. Usuario hace clic en "Sin Categorizar"
  2. Se abre modal con loading state
  3. Petición al endpoint filtrando por tipo
  4. Muestra lista de categorías disponibles
  5. Usuario selecciona categoría
  6. Actualización visual inmediata
  7. Cierre del modal
- **ESTADOS**:
  - Loading: Spinner con mensaje
  - Error: Mensaje de error con opción de reintentar
  - Vacío: Mensaje informativo
  - Éxito: Lista scrolleable de categorías

#### 5. Ordenación de Transacciones por Fecha
- **IMPLEMENTADO**: Ordenación automática por fecha (menor a mayor)
- **ORDEN**: Del día 1 del mes al último día del mes
- **APLICACIÓN**: Se aplica antes de la paginación
- **PERSISTENCIA**: Se mantiene durante toda la sesión

---

## 📋 Nuevos Componentes y Funcionalidades

### Signals Añadidos
```typescript
// Paginación
currentPage = signal(1);
pageSize = 10;

// Editor de categorías
showCategoryModal = signal(false);
editingTransaction = signal<ProcessedTransaction | null>(null);
availableCategories = signal<Category[]>([]);
loadingCategories = signal(false);
categoriesError = signal<string | null>(null);
```

### Computed Signals Mejorados
```typescript
// Ordenación por fecha integrada
transactions = computed(() => {
  return response.data.transacciones
    .map(t => ({ ...t, selected: t.selected ?? true }))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
});

// Nuevos computed para paginación
paginatedTransactions = computed(() => {
  const start = (this.currentPage() - 1) * this.pageSize;
  const end = start + this.pageSize;
  return this.transactions().slice(start, end);
});

totalPages = computed(() => 
  Math.ceil(this.transactions().length / this.pageSize)
);
```

### Métodos Añadidos

#### Paginación
```typescript
nextPage(): void;
previousPage(): void;
```

#### Editor de Categorías
```typescript
openCategoryEditor(transaction: ProcessedTransaction): void;
closeCategoryModal(): void;
loadCategoriesForType(type: 'expense' | 'income'): void;
selectCategory(category: Category): void;
```

---

## 🎨 Nuevos Estilos CSS

### Account Hint
```css
.account-hint {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}
```

### Category Badge Editable
```css
.category-badge.editable {
  cursor: pointer;
  background: #fef3c7;
  color: #92400e;
  border: 1px dashed #f59e0b;
  transition: all 0.2s;
}

.category-badge.editable:hover {
  background: #fde68a;
  border-color: #d97706;
  transform: translateY(-1px);
}
```

### Paginación
```css
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: white;
}
```

### Modal de Categorías
- `.category-modal`: Contenedor del modal
- `.transaction-preview`: Vista previa de la transacción a editar
- `.categories-list`: Lista scrolleable de categorías
- `.category-option`: Botón de selección de categoría

---

## 🔧 Integración con Backend

### Endpoint de Categorías Disponibles
**URL**: `GET /api/categories/available/all?type={tipo}`

**Parámetros**:
- `type` (opcional): `expense` | `income`

**Respuesta Esperada**:
```json
[
  {
    "id": "cat-123",
    "name": "Alimentación",
    "type": "expense",
    "color": "#ef4444",
    ...
  },
  ...
]
```

**Manejo de Errores**:
- 401: Usuario no autenticado
- 500: Error del servidor
- Timeout: Error de conexión

---

## ✅ Testing Completado

### Casos Validados
- [x] Account-select muestra correctamente todos los nombres de cuenta
- [x] Account-id se captura correctamente al seleccionar
- [x] Paginación funciona con 1, 10, 11, 50, 100+ transacciones
- [x] Modal de categorías se abre solo para "Sin Categorizar"
- [x] Categorías se filtran correctamente por tipo (income/expense)
- [x] Cambio de categoría se refleja inmediatamente en la UI
- [x] Transacciones ordenadas por fecha ascendente
- [x] Estado de página se mantiene al editar categorías

---

## 🚀 Próximas Mejoras Sugeridas

1. **Salto directo a páginas**: Permitir ir a una página específica
2. **Cambio de tamaño de página**: Selector de 10/25/50/100 items
3. **Búsqueda de categorías**: Input de búsqueda en el modal
4. **Categorías recientes**: Mostrar las últimas categorías usadas
5. **Undo/Redo**: Deshacer cambios de categoría
6. **Bulk edit**: Cambiar categoría de múltiples transacciones a la vez

---

**Fecha de última actualización**: 31 de diciembre de 2025
**Versión**: 2.0.0
