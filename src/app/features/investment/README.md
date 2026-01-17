# 📈 Módulo de Inversiones Bursátiles

## 🎯 Descripción General

Módulo completo para gestionar inversiones en acciones con datos en tiempo real, cálculos automáticos de ganancias/pérdidas y recomendaciones de diversificación.

## ✨ Características Principales

### 1. **Dashboard de Inversiones**
- **KPIs en Tiempo Real**: Valor total, rendimiento histórico, ganancia del día
- **Tabla de Activos**: Vista detallada de todas tus posiciones
- **Insights Inteligentes**: Recomendaciones automáticas de diversificación

### 2. **Búsqueda de Acciones**
- Búsqueda en tiempo real mediante tickers (AAPL, TSLA, etc.)
- Integración con API de Alpha Vantage
- Datos de cotización actualizados

### 3. **Gestión de Posiciones**
- Agregar nuevas inversiones con modal intuitivo
- Editar posiciones existentes
- Eliminar inversiones con confirmación

### 4. **Cálculos Automáticos**
- **Valor Total**: `posición × precio_actual`
- **Ganancia/Pérdida ($)**: `(precio_actual - precio_compra) × posición`
- **Ganancia/Pérdida (%)**: `((precio_actual - precio_compra) / precio_compra) × 100`
- **Rendimiento del Portfolio**: Suma total de todas las posiciones

## 🎨 Diseño Visual

### Paleta de Colores
- 🟢 **Verde** (`#07883b`): Ganancias y valores positivos
- 🔴 **Rojo** (`#b91c1c`): Pérdidas y valores negativos
- 🔵 **Azul** (`#3b82f6`): Elementos principales
- 🟣 **Púrpura** (`#6366f1`): Gradientes y acentos

### Componentes UI
- **Cards KPI**: Gradient azul para valor total, white cards para métricas
- **Tabla Responsive**: Adaptada a móviles y tablets
- **Modal Moderno**: Formulario de agregar inversión con preview
- **Insights Cards**: Alertas visuales con iconos y colores según tipo

## 🔧 Arquitectura Técnica

### Estructura de Archivos
```
frontend/src/app/features/investment/
├── investment.component.ts       # Lógica del componente
├── investment.component.html     # Template HTML
└── investment.component.scss     # Estilos

frontend/src/app/core/
├── models/
│   └── investment.model.ts       # Interfaces TypeScript
└── services/
    └── investment.service.ts     # Servicio de API
```

### Modelos Principales

#### `EnrichedPosition`
```typescript
{
  id: number;
  symbol: string;              // Ticker (AAPL)
  companyName: string;          // Apple Inc.
  shares: number;               // Cantidad de acciones
  averagePrice: number;         // Precio promedio de compra
  currentPrice: number;         // Precio actual del mercado
  totalValue: number;           // shares × currentPrice
  totalGainLoss: number;        // Ganancia/pérdida en $
  totalGainLossPercent: number; // Ganancia/pérdida en %
  dayChange: number;            // Cambio del día en $
}
```

#### `PortfolioSummary`
```typescript
{
  totalValue: number;           // Valor total del portfolio
  totalInvested: number;        // Total invertido
  totalGainLoss: number;        // Ganancia/pérdida total
  totalGainLossPercent: number; // % de rendimiento
  dayChange: number;            // Cambio total del día
  positionsCount: number;       // Número de posiciones
}
```

### Servicios

#### `InvestmentService`
- **`searchStocks(query)`**: Buscar acciones por ticker/nombre
- **`getStockQuote(symbol)`**: Obtener cotización actual
- **`getUserPositions()`**: Obtener posiciones del usuario
- **`enrichPositions(positions)`**: Enriquecer con datos de mercado
- **`addPosition(request)`**: Agregar nueva posición
- **`deletePosition(id)`**: Eliminar posición

## 🌐 Integración con API Externa

### Alpha Vantage (Datos Bursátiles)
- **URL**: `https://www.alphavantage.co/query`
- **API Key**: Configurar en `investment.service.ts`
- **Endpoints Usados**:
  - `SYMBOL_SEARCH`: Búsqueda de tickers
  - `GLOBAL_QUOTE`: Cotizaciones en tiempo real

### Configuración
1. Registrarse en [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Obtener API Key gratuita
3. Reemplazar en `investment.service.ts`:
```typescript
private readonly ALPHA_VANTAGE_KEY = 'TU_API_KEY_AQUI';
```

## 🚀 Modo de Desarrollo

El servicio incluye **datos mock** que se activan automáticamente cuando:
- No hay conexión con la API
- Ocurre un error en la petición
- Estás desarrollando sin API key

### Mock Data Incluido
- 8 acciones populares: AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, NFLX
- 4 posiciones de ejemplo en el portfolio
- Cotizaciones simuladas con variaciones realistas

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 768px - Grid 3 columnas, tabla completa
- **Tablet**: 768px - Grid 2 columnas, tabla scroll horizontal
- **Mobile**: < 768px - Grid 1 columna, cards apiladas

### Optimizaciones Móviles
- Buscador adaptativo con resultados full-width
- Tabla con scroll horizontal
- Modal full-screen en móviles pequeños
- Botones táctiles optimizados

## 🔐 Backend (Pendiente de Implementación)

### Endpoints Necesarios

#### `GET /api/investments`
Obtener todas las posiciones del usuario
```json
{
  "positions": [
    {
      "id": 1,
      "user_id": 123,
      "symbol": "AAPL",
      "company_name": "Apple Inc.",
      "shares": 50,
      "average_price": 165.50,
      "purchase_date": "2024-01-15",
      "notes": "Long term investment"
    }
  ]
}
```

#### `POST /api/investments`
Crear nueva posición
```json
{
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "shares": 50,
  "average_price": 165.50,
  "purchase_date": "2024-01-15",
  "notes": "Optional notes"
}
```

#### `PATCH /api/investments/:id`
Actualizar posición existente
```json
{
  "shares": 60,
  "average_price": 170.00
}
```

#### `DELETE /api/investments/:id`
Eliminar posición

### Modelo de Base de Datos
```sql
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    shares DECIMAL(10, 4) NOT NULL,
    average_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investments_user_id ON investments(user_id);
```

## 🎓 Guía de Uso

### Para Usuarios

1. **Ver Dashboard**
   - Navega a "Inversión" en el menú
   - Visualiza tus KPIs y posiciones actuales

2. **Buscar Acciones**
   - Escribe el ticker (AAPL) o nombre (Apple) en el buscador
   - Selecciona de los resultados

3. **Agregar Inversión**
   - Click en "Agregar Inversión"
   - Selecciona la acción del buscador
   - Ingresa cantidad de acciones y precio de compra
   - Confirma para agregar

4. **Eliminar Inversión**
   - Click en el icono de papelera en la tabla
   - Confirma la eliminación

### Para Desarrolladores

1. **Extender Funcionalidad**
   ```typescript
   // En investment.component.ts
   customCalculation(): void {
     const positions = this.positions();
     // Tu lógica aquí
   }
   ```

2. **Agregar Nuevos Insights**
   ```typescript
   // En el computed insights
   if (customCondition) {
     insights.push({
       type: 'warning',
       title: 'Nuevo Insight',
       message: 'Mensaje personalizado',
       icon: '⚠️'
     });
   }
   ```

3. **Cambiar API de Datos**
   ```typescript
   // En investment.service.ts
   // Reemplaza las URLs de Alpha Vantage
   // por tu API preferida
   ```

## 📊 Fórmulas de Cálculo

### Valor Total de Posición
```
Valor Total = Número de Acciones × Precio Actual
```

### Ganancia/Pérdida en Dólares
```
G/P ($) = (Precio Actual - Precio Compra) × Número de Acciones
```

### Ganancia/Pérdida Porcentual
```
G/P (%) = ((Precio Actual - Precio Compra) / Precio Compra) × 100
```

### Rendimiento Total del Portfolio
```
Rendimiento (%) = ((Valor Total - Inversión Total) / Inversión Total) × 100
```

## 🐛 Solución de Problemas

### Error: "No se pueden cargar las posiciones"
- Verificar conexión a internet
- Revisar logs del backend
- Confirmar que el servicio está corriendo

### Error: "API Key inválida" (Alpha Vantage)
- Verificar que la API key esté correctamente configurada
- Revisar límites de peticiones (5 por minuto en plan gratuito)
- Usar datos mock para desarrollo

### Tabla vacía al iniciar
- Normal si es primera vez
- Click en "Agregar Inversión" para empezar
- Datos mock se cargan automáticamente en desarrollo

## 🚀 Próximas Mejoras

- [ ] Gráficos de rendimiento histórico
- [ ] Alertas de precio personalizadas
- [ ] Exportación a PDF/Excel
- [ ] Comparación con índices (S&P 500)
- [ ] Análisis de sectores y diversificación
- [ ] Modo oscuro
- [ ] Notificaciones push

## 📝 Notas Técnicas

- Usa **Angular Signals** para estado reactivo
- **Standalone Components** (no NgModules)
- **Lazy Loading** para optimizar carga inicial
- **HttpClient** para peticiones API
- **RxJS** para manejo de streams asíncronos
- **SCSS** con variables y mixins

## 📄 Licencia

Parte del proyecto MyFi - Aplicación de Finanzas Personales
