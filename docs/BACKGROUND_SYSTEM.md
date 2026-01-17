# Sistema de Backgrounds Estandarizado - AppFinanzas

## 📋 Resumen

Se ha implementado un sistema unificado de backgrounds para toda la aplicación, garantizando consistencia visual en modo claro y oscuro.

---

## 🎨 Variables CSS Definidas

### Modo Claro (Light Mode)

```css
:root {
  --bg-app: #f8fafc;       /* Slate-50 - Fondo principal de la app */
  --bg-page: #ffffff;      /* Blanco - Fondo de contenido/tarjetas */
  --bg-elevated: #ffffff;  /* Blanco - Elementos elevados */
  --bg-hover: #f1f5f9;     /* Slate-100 - Hover states */
}
```

### Modo Oscuro (Dark Mode)

```css
body.dark-mode {
  --bg-app: #0f172a;       /* Slate-900 - Fondo principal de la app */
  --bg-page: #1e293b;      /* Slate-800 - Fondo de contenido/tarjetas */
  --bg-elevated: #334155;  /* Slate-700 - Elementos elevados */
  --bg-hover: #475569;     /* Slate-600 - Hover states */
}
```

---

## 🛠️ Clases Utilitarias

### `.page-layout`
**Uso:** Contenedor raíz de páginas principales.

```html
<div class="page-layout">
  <!-- Contenido de la página -->
</div>
```

**Propiedades:**
- `min-height: 100vh` (ocupa toda la altura de la ventana)
- `background: var(--bg-app)` (fondo principal)

---

### `.page-container`
**Uso:** Contenedor de contenido con ancho máximo y padding responsive.

```html
<div class="page-container">
  <!-- Contenido centrado -->
</div>
```

**Propiedades:**
- `max-width: 1400px`
- `margin: 0 auto` (centrado)
- `padding: 2rem` (1rem en mobile)

---

### `.content-card`
**Uso:** Tarjetas/secciones con fondo y sombra.

```html
<div class="content-card">
  <!-- Contenido de la tarjeta -->
</div>
```

**Propiedades:**
- `background: var(--bg-page)`
- `border-radius: 0.75rem`
- `padding: 1.5rem`
- `box-shadow` con efecto hover

---

## 📄 Componentes Actualizados

### ✅ Páginas Principales

| Componente | Clase Contenedor | Background |
|-----------|------------------|------------|
| Dashboard | `.dashboard-container` | `var(--bg-app)` |
| Inversiones | `.investment-page` | `var(--bg-app)` |
| Cuentas | `.accounts-page` | `var(--bg-app)` |
| Transacciones | `.transactions-layout` | `var(--bg-app)` |
| Detalle de Cuenta | `.account-detail-page` | `var(--bg-app)` |
| Carga de Extracto | `.upload-layout` | `var(--bg-app)` |

### ✅ Componentes de Autenticación

| Componente | Background |
|-----------|------------|
| Login | Gradiente personalizado (branding) |
| Register | Gradiente personalizado (branding) |

> **Nota:** Los componentes de autenticación mantienen sus gradientes decorativos en la sección de branding, pero la sección del formulario usa `var(--bg-app)` en modo oscuro.

---

## 🎯 Beneficios del Sistema

### ✨ Consistencia Visual
- **Color único en toda la app:** Todas las páginas comparten el mismo tono de fondo (`#f8fafc` - Slate 50)
- **Sin gradientes conflictivos:** Se eliminaron gradientes variados que competían entre sí

### 🌓 Soporte Dark Mode Nativo
- **Cambio automático:** Al activar dark mode, todos los fondos cambian coherentemente
- **Variables CSS:** El sistema usa CSS custom properties que se actualizan globalmente

### ♿ Accesibilidad Mejorada
- **Contraste consistente:** El fondo Slate-50 garantiza suficiente contraste con textos oscuros
- **Reducción de fatiga visual:** Color neutral que no cansa la vista

### 🚀 Mantenibilidad
- **Punto único de control:** Cambiar el color global solo requiere modificar una variable
- **Escalable:** Nuevos componentes heredan automáticamente el sistema

---

## 📝 Guía de Implementación

### Para Nuevos Componentes

#### Opción 1: Usar Clases Utilitarias (Recomendado)

```typescript
@Component({
  selector: 'app-nuevo-componente',
  template: `
    <div class="page-layout">
      <div class="page-container">
        <div class="content-card">
          <!-- Tu contenido aquí -->
        </div>
      </div>
    </div>
  `
})
```

#### Opción 2: Usar Variables CSS Directamente

```typescript
@Component({
  selector: 'app-nuevo-componente',
  template: `<div class="mi-componente">...</div>`,
  styles: [`
    .mi-componente {
      min-height: 100vh;
      background: var(--bg-app, #f8fafc);
      /* El fallback #f8fafc es opcional pero recomendado */
    }
  `]
})
```

---

## 🔄 Migración de Componentes Existentes

### Antes (Inconsistente)

```scss
.dashboard-container {
  background: linear-gradient(180deg, #9ca3af 40%, #ffffff 100%);
}

.investment-page {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
}

.accounts-page {
  background: #f8fafc;
}
```

### Después (Estandarizado)

```scss
.dashboard-container,
.investment-page,
.accounts-page {
  background: var(--bg-app, #f8fafc);
}
```

---

## 🎨 Paleta de Colores de Fondo

### Jerarquía Visual

```
┌─────────────────────────────────────┐
│  --bg-app (#f8fafc)                │  ← Fondo principal
│  ┌───────────────────────────────┐ │
│  │  --bg-page (#ffffff)          │ │  ← Tarjetas/Contenido
│  │  ┌─────────────────────────┐  │ │
│  │  │  --bg-elevated (#fff)   │  │ │  ← Modales/Dropdowns
│  │  │                         │  │ │
│  │  └─────────────────────────┘  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Uso por Tipo de Elemento

| Elemento | Variable | Uso |
|----------|----------|-----|
| Página completa | `--bg-app` | `<body>`, `.page-layout` |
| Tarjetas | `--bg-page` | Cards, sections, panels |
| Modales | `--bg-elevated` | Dialogs, dropdowns, tooltips |
| Hover | `--bg-hover` | Estado hover en botones/inputs |

---

## ⚠️ Excepciones

### Componentes con Fondos Decorativos

Algunos componentes mantienen fondos personalizados por razones de diseño:

1. **Login/Register - Sección Branding:**
   ```scss
   .branding-section {
     background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
   }
   ```
   **Razón:** Identidad visual fuerte en la primera impresión.

2. **Health Card Component:**
   ```scss
   .health-card {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   }
   ```
   **Razón:** Componente decorativo tipo widget.

---

## 🧪 Testing de Compatibilidad

### Checklist de QA

- [x] ✅ Dashboard renderiza con `#f8fafc`
- [x] ✅ Inversiones renderiza con `#f8fafc`
- [x] ✅ Cuentas renderiza con `#f8fafc`
- [x] ✅ Transacciones renderiza con `#f8fafc`
- [x] ✅ Detalle de cuenta renderiza con `#f8fafc`
- [x] ✅ Carga de extractos renderiza con `#f8fafc`
- [ ] ⏳ Dark mode cambia a `#0f172a` correctamente
- [ ] ⏳ Transiciones entre modos son suaves
- [ ] ⏳ Contraste WCAG AA cumplido en ambos modos

---

## 🔗 Archivos Modificados

### Archivos de Estilos Globales
- `frontend/src/styles.scss` - Variables CSS y clases utilitarias

### Componentes SCSS
- `frontend/src/app/features/dashboard/dashboard.component.scss`
- `frontend/src/app/features/investment/investment.component.scss`

### Componentes TypeScript (Inline Styles)
- `frontend/src/app/features/accounts/accounts.component.ts`
- `frontend/src/app/features/transactions/transactions.component.ts`
- `frontend/src/app/features/account-detail/account-detail.component.ts`
- `frontend/src/app/features/transactions/upload-statement.component.ts`

---

## 📚 Recursos Relacionados

- [Typography System](./TYPOGRAPHY_SYSTEM.md) - Sistema de tipografía
- [Tailwind Slate Color](https://tailwindcss.com/docs/customizing-colors#color-palette-reference) - Referencia de colores Slate

---

**Última actualización:** 15 de enero de 2026  
**Mantenedor:** Equipo Frontend AppFinanzas  
**Versión:** 1.0.0
