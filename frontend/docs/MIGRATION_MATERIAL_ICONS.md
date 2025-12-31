# Migración a Material Icons

## Resumen
Se ha completado la migración del sistema de iconos personalizado (`assets/icons/*.png`) a **Material Icons** de Angular Material.

## Cambios Realizados

### ✅ Componentes Migrados

1. **SharedTransactionTableComponent** (`shared/components/transaction-table.component.ts`)
   - Implementa mapeo de 60+ categorías a Material Icons
   - Diccionario `CATEGORY_ICON_MAP` con iconos semánticos
   - Soporte completo para todas las categorías del sistema

2. **AccountTransactionsTableComponent** (`features/account-detail/components/account-transactions-table.component.ts`)
   - Refactorizado para usar `SharedTransactionTableComponent`
   - Eliminados métodos obsoletos: `getCategoryIcon()`, `onIconError()`
   - Template simplificado usando `<app-transaction-table>`

3. **TransactionsTableWrapperComponent** (`features/transactions/components/transaction-table.component.ts`)
   - Wrapper que usa `SharedTransactionTableComponent`
   - Selector actualizado a `app-transactions-table-wrapper`

### 🗑️ Archivos Eliminados

- **`core/utils/category-icon-mapper.ts`** - Sistema legacy de mapeo de iconos
- **`assets/icons/*.png`** - Todos los archivos de iconos (14 archivos)
- **`assets/icons/`** - Carpeta completa eliminada

### 📦 Dependencias Añadidas

```json
{
  "@angular/material": "^19.0.0",
  "@angular/cdk": "^19.0.0"
}
```

### 🔧 Configuración Añadida

**`index.html`**
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

## Beneficios

✅ **Mantenimiento**: Sin necesidad de gestionar archivos de imágenes  
✅ **Consistencia**: Iconos uniformes de Material Design en toda la app  
✅ **Performance**: Material Icons se cargan más rápido que PNG  
✅ **Escalabilidad**: Iconos vectoriales escalables sin pérdida de calidad  
✅ **Accesibilidad**: Mejor soporte para temas y modos oscuros  
✅ **Reutilización**: Componente de tabla compartido entre múltiples páginas

## Uso

### En Templates

```html
<mat-icon>shopping_cart</mat-icon>
<mat-icon>restaurant</mat-icon>
<mat-icon>local_gas_station</mat-icon>
```

### En el Componente Compartido

El mapeo de categorías a iconos se gestiona automáticamente:

```typescript
const CATEGORY_ICON_MAP: Record<string, string> = {
  'supermercado': 'shopping_cart',
  'restaurante': 'restaurant',
  'gasolina': 'local_gas_station',
  // ... 60+ categorías
};
```

## Iconos Disponibles

Ver el diccionario completo en:
- `shared/components/transaction-table.component.ts` (líneas 20-85)

Categorías soportadas:
- Gastos Básicos (supermercado, restaurante, transporte, etc.)
- Vivienda (alquiler, hipoteca, mantenimiento, etc.)
- Salud (médico, farmacia, gimnasio, etc.)
- Educación (cursos, libros, matrícula, etc.)
- Ocio (cine, viajes, suscripciones, etc.)
- Ingresos (salario, freelance, inversiones, etc.)

## Próximos Pasos

- ✅ Migración completada
- ✅ Sistema legacy eliminado
- ⏭️ Opcional: Agregar más iconos según nuevas categorías
- ⏭️ Opcional: Implementar tema personalizado de Material

---

**Fecha de migración**: 29 de diciembre de 2025  
**Versión Angular**: 21.0.0  
**Versión Material**: 19.0.0
