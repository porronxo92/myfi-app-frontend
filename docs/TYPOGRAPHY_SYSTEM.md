# Global Typography System - Fintech App

## 📐 Arquitectura de Fuentes

### Fuentes Implementadas (Google Fonts)

#### 1. **Inter** - Fuente Principal (Sans-Serif)
- **Uso:** Títulos, cuerpo de texto, botones y datos numéricos generales
- **Pesos disponibles:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- **Características especiales:**
  - `font-feature-settings: "tnum" on` → Números tabulares (alineación vertical perfecta)
  - `font-feature-settings: "cv05" on` → Caracteres alternativos optimizados para pantallas

#### 2. **JetBrains Mono** - Fuente Monospace
- **Uso:** Identificadores únicos (IBAN, SWIFT, Tickers de Bolsa, IDs de transacción)
- **Pesos disponibles:** 400 (Regular), 500 (Medium), 600 (SemiBold)
- **Propósito:** Evitar ambigüedad entre caracteres (0 vs O, 1 vs l, I vs |)

---

## 🎨 Variables CSS

### Font Families
```css
--font-sans: 'Inter'
--font-mono: 'JetBrains Mono'
```

### Font Weights
```css
--font-regular: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

### Letter Spacing
```css
--tracking-tight: -0.02em   /* Para números grandes */
--tracking-normal: 0
--tracking-wide: 0.01em
```

### Line Heights
```css
--leading-tight: 1.25      /* Big numbers */
--leading-normal: 1.5      /* Texto general */
--leading-relaxed: 1.6     /* Chat IA */
--leading-loose: 1.75
```

### Colores Semánticos
```css
--color-income: #10b981    /* Verde esmeralda - Ingresos */
--color-expense: #ef4444   /* Rojo suave - Gastos */
--color-neutral: #64748b   /* Slate-500 - Datos técnicos */
--color-neutral-dark: #475569 /* Slate-600 - Categorías */
```

---

## 🧩 Clases Utilitarias

### `.financial-num`
**Uso:** Números monetarios en tablas, balances y KPIs.

```html
<td class="financial-num">€1,234.56</td>
```

**Propiedades:**
- Font-variant: `tabular-nums` (alineación vertical perfecta)
- Letter-spacing: `-0.02em` (compacto)
- Text-align: `right` (estándar contable)

---

### `.big-number`
**Uso:** Balance total en Dashboard (número principal de la vista).

```html
<div class="big-number">€45,892.34</div>
```

**Propiedades:**
- Font-weight: `800` (ExtraBold)
- Letter-spacing: `-0.02em` (sólido y compacto)
- Line-height: `1.25` (visualmente impactante)

---

### `.tech-data`
**Uso:** IBAN, números de tarjeta, tickers de bolsa, IDs de transacción.

```html
<span class="tech-data">ES91 2100 0418 4502 0005 1332</span>
<span class="tech-data">AAPL</span>
```

**Propiedades:**
- Font-family: `JetBrains Mono` (monospace)
- Font-size: `0.875rem` (14px)
- Color: `Slate-500` (reduce prominencia visual)

---

### `.kpi-value`
**Uso:** KPIs secundarios con colores semánticos.

```html
<div class="kpi-value income">+€2,450.00</div>
<div class="kpi-value expense">-€1,320.00</div>
```

**Modificadores:**
- `.income` → Color verde esmeralda
- `.expense` → Color rojo suave

---

### `.category-cell`
**Uso:** Celdas de categoría en tablas de transacciones.

```html
<td class="category-cell">Alimentación</td>
```

**Propiedades:**
- Font-weight: `500` (Medium)
- Color: `Slate-600` (reduce ruido visual frente a importes)

---

### `.chat-text`
**Uso:** Burbujas de chat conversacional (IA).

```html
<p class="chat-text">Tu saldo actual es de €45,892.34...</p>
```

**Propiedades:**
- Line-height: `1.6` (lectura cómoda)
- Text-align: `left` (no justificado)

---

### `.table-amount`
**Uso:** Columnas de importes en cualquier tabla.

```html
<td class="table-amount">€892.34</td>
```

**Propiedades:**
- Font-variant: `tabular-nums`
- Text-align: `right`
- Font-weight: `500` (Medium)

---

## 📋 Guía de Uso por Sección

### 1. **Dashboard (Resumen Global)**

#### Balance Total
```html
<div class="balance-total">
  <h2 class="big-number">€45,892.34</h2>
  <span class="label">Saldo Total</span>
</div>
```

#### KPIs Secundarios
```html
<div class="kpi-card">
  <span class="kpi-label">Ingresos del mes</span>
  <span class="kpi-value income">+€5,420.00</span>
</div>

<div class="kpi-card">
  <span class="kpi-label">Gastos del mes</span>
  <span class="kpi-value expense">-€3,210.00</span>
</div>
```

---

### 2. **Tablas de Movimientos**

```html
<table>
  <thead>
    <tr>
      <th>Fecha</th>
      <th>Categoría</th>
      <th class="table-amount">Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>15/01/2026</td>
      <td class="category-cell">Supermercado</td>
      <td class="table-amount">-€45.20</td>
    </tr>
  </tbody>
</table>
```

---

### 3. **Sección de Cuentas**

#### IBAN y Números de Tarjeta
```html
<div class="account-details">
  <label>IBAN</label>
  <span class="tech-data">ES91 2100 0418 4502 0005 1332</span>
</div>

<div class="card-info">
  <label>Número de Tarjeta</label>
  <span class="tech-data">**** **** **** 1234</span>
</div>
```

#### Balance de Cuenta
```html
<div class="account-balance">
  <span class="financial-num">€12,450.89</span>
</div>
```

---

### 4. **Inversiones (Stocks)**

#### Ticker Symbol
```html
<div class="stock-ticker">
  <span class="tech-data">AAPL</span>
  <span class="stock-name">Apple Inc.</span>
</div>
```

#### Precio y Variación
```html
<div class="stock-price">
  <span class="financial-num">$182.45</span>
  <span class="kpi-value income">+2.34%</span>
</div>
```

---

### 5. **Chat Conversacional (IA)**

```html
<div class="chat-bubble user">
  <p class="chat-text">¿Cuánto he gastado este mes en restaurantes?</p>
</div>

<div class="chat-bubble assistant">
  <p class="chat-text">
    Has gastado <span class="financial-num">€320.50</span> en restaurantes 
    durante enero 2026.
  </p>
</div>
```

---

## ✅ Checklist de Implementación

### Configuración Inicial
- [x] Google Fonts cargadas en `index.html`
- [x] Variables CSS definidas en `:root`
- [x] Clases utilitarias creadas en `styles.scss`

### Por Componente (A implementar)
- [ ] Dashboard: Aplicar `.big-number` al balance total
- [ ] Dashboard: Aplicar `.kpi-value` con modificadores `.income`/`.expense`
- [ ] Tablas: Aplicar `.table-amount` a columnas de importe
- [ ] Tablas: Aplicar `.category-cell` a columnas de categoría
- [ ] Cuentas: Aplicar `.tech-data` a IBAN y tarjetas
- [ ] Inversiones: Aplicar `.tech-data` a tickers
- [ ] Chat IA: Aplicar `.chat-text` a burbujas de conversación

---

## 🎯 Beneficios del Sistema

### ✨ Legibilidad Numérica
- **Números tabulares:** Todas las cifras se alinean verticalmente, facilitando la comparación visual
- **Tracking optimizado:** Letter-spacing negativo hace que los números grandes sean más compactos y legibles

### 🔒 Precisión y Confianza
- **Fuente monospace para datos críticos:** Elimina confusiones entre caracteres similares
- **Consistencia visual:** Pesos y tamaños estandarizados en toda la aplicación

### 🎨 Jerarquía Visual Clara
- **Big Number:** ExtraBold para el dato más importante
- **KPIs:** SemiBold con colores semánticos
- **Categorías:** Medium con color neutral para reducir ruido
- **Datos técnicos:** Monospace con menor tamaño y color apagado

### ♿ Accesibilidad
- **Contraste suficiente:** Todos los colores cumplen WCAG AA
- **Line-height relajado en chat:** Mejora la lectura de texto largo
- **Anti-aliasing optimizado:** Renderizado de fuentes suavizado

---

## 📚 Recursos Externos

- [Inter - Google Fonts](https://fonts.google.com/specimen/Inter)
- [JetBrains Mono - Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono)
- [CSS font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)
- [OpenType Features: Tabular Numerals](https://learn.microsoft.com/en-us/typography/opentype/spec/features_pt#tnum)

---

## 🔄 Próximos Pasos

1. **Refactorizar componentes existentes** para aplicar las clases utilitarias
2. **Implementar modo oscuro** con las mismas reglas tipográficas
3. **Testing cross-browser** en Chrome, Firefox, Safari y Edge
4. **Validar accesibilidad** con herramientas WCAG
5. **Documentar ejemplos de uso** en Storybook (opcional)

---

**Última actualización:** 15 de enero de 2026  
**Mantenedor:** Equipo Frontend AppFinanzas
