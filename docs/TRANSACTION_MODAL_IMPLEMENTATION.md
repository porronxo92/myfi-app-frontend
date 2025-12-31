# Implementación de Modal Reutilizable para Transacciones y Transferencias

## ✅ Componente Implementado

**Ubicación:** `src/app/shared/components/transaction-modal.component.ts`

### Características Principales

#### 1. **Modo Dual: Transacciones y Transferencias**

La modal funciona en dos modos configurables mediante props:

```typescript
interface TransactionModalData {
  mode: 'transaction' | 'transfer';
  preselectedAccountId?: string;
  accountName?: string;
}
```

#### 2. **Campos del Formulario**

**Campos Comunes:**
- ✅ `description` (obligatorio) - Input de texto
- ✅ `amount` (obligatorio) - Input numérico con validación min 0.01
- ✅ `date` (obligatorio) - Date picker con valor por defecto hoy
- ✅ `notes` (opcional) - Textarea
- ✅ `tags` (opcional) - Chips input con Material Chips

**Campos Condicionales:**

**Modo Transacción:**
- ✅ `type` - Selector visual (Ingreso/Gasto) con botones
- ✅ `category_id` - Selector filtrado por tipo de transacción
- ✅ `account_id` - Preseleccionado si viene desde `/accounts/:id`, selector si viene desde `/transactions`

**Modo Transferencia:**
- ✅ `type` - Fijo como "transferencia" (no editable)
- ✅ `transfer_account_id` - Selector de cuenta destino (excluye cuenta origen)
- ✅ `category_id` - Selector sin filtro de tipo

**Campo Automático:**
- ✅ `source` - Fijo como "manual" (no visible en UI)

#### 3. **Validaciones Implementadas**

```typescript
- description: required
- amount: required, min(0.01)
- date: required
- type: required
- category_id: required
- account_id: required
- transfer_account_id: required (solo en modo transfer)
- Validación especial: transfer_account_id ≠ account_id
```

#### 4. **Integración de Servicios**

- ✅ `CategoryService` - Carga y filtra categorías por tipo
- ✅ `AccountService` - Carga cuentas del usuario
- ✅ `TransactionService` - Envía transacción al backend

#### 5. **UX/UI Features**

- ✅ Modal responsive (600px desktop, 90vw móvil)
- ✅ Botones de tipo con iconos de Material Icons
- ✅ Selector de categorías con indicador de color
- ✅ Chips para etiquetas (añadir con Enter)
- ✅ Date picker integrado
- ✅ Indicador de loading en botón submit
- ✅ Validaciones visuales claras
- ✅ Título dinámico según modo

---

## 🎯 Integración en Páginas

### 1. Página Account Detail (`/accounts/:id`)

**Archivos modificados:**
- `features/account-detail/account-detail.component.ts`
- `features/account-detail/components/account-transactions-table.component.ts`

**Botones disponibles:**

1. **"Agregar movimiento"** (header de tabla)
   - Abre modal en modo `transaction`
   - Campo `account_id` preseleccionado y bloqueado
   - Usuario elige: tipo (ingreso/gasto), categoría, descripción, importe, fecha

2. **"Transferir"** (header de tabla)
   - Abre modal en modo `transfer`
   - Campo `account_id` preseleccionado (cuenta origen)
   - Usuario selecciona `transfer_account_id` (cuenta destino)
   - Tipo fijo como "transferencia"

```typescript
handleAddTransaction(): void {
  const dialogData: TransactionModalData = {
    mode: 'transaction',
    preselectedAccountId: this.accountId,
    accountName: this.account()?.name
  };

  const dialogRef = this.dialog.open(TransactionModalComponent, {
    width: '600px',
    data: dialogData
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) this.loadData(); // Refresh data
  });
}
```

### 2. Página Transactions (`/transactions`)

**Archivos modificados:**
- `features/transactions/transactions.component.ts`
- `features/transactions/components/transaction-header.component.ts`

**Botones disponibles:**

1. **"Nueva Transacción"** (header)
   - Abre modal en modo `transaction`
   - Usuario debe seleccionar cuenta manualmente
   - Sin preselección de campos

2. **"Transferir"** (header)
   - Abre modal en modo `transfer`
   - Usuario selecciona ambas cuentas (origen y destino)
   - Sin preselección de campos

```typescript
handleNewTransaction(): void {
  const dialogData: TransactionModalData = {
    mode: 'transaction'
    // No preselected account
  };

  const dialogRef = this.dialog.open(TransactionModalComponent, {
    width: '600px',
    data: dialogData
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) this.loadData();
  });
}
```

---

## 📦 Payload Generado

### Ejemplo: Transacción (Gasto)

```json
{
  "account_id": "uuid-account",
  "type": "expense",
  "category_id": "uuid-category",
  "description": "Compra en supermercado",
  "amount": 45.50,
  "date": "2025-12-29",
  "source": "manual",
  "notes": "Compra semanal",
  "tags": ["alimentación", "semanal"]
}
```

### Ejemplo: Transferencia

```json
{
  "account_id": "uuid-account-origen",
  "transfer_account_id": "uuid-account-destino",
  "type": "transferencia",
  "category_id": "uuid-category",
  "description": "Traspaso entre cuentas",
  "amount": 200.00,
  "date": "2025-12-29",
  "source": "manual"
}
```

---

## 🔧 Tecnologías Utilizadas

- **Angular 21** - Standalone components
- **Angular Material 21** - Dialog, Form Fields, Date Picker, Chips
- **Reactive Forms** - FormBuilder, Validators
- **RxJS** - Observables, subscriptions
- **Signals** - State management reactivo

---

## ✨ Mejoras Implementadas

1. **Componente único y reutilizable** - Un solo archivo para ambos modos
2. **Configuración por props** - Sin lógica hardcodeada
3. **Validación robusta** - Validaciones sincrónicas y custom
4. **UX optimizada** - Material Design, responsive, accesible
5. **Type safety completo** - TypeScript estricto
6. **Separación de responsabilidades** - Presentación vs lógica
7. **Fácil extensión** - Agregar campos futuros es trivial

---

## 🚀 Próximos Pasos Sugeridos

### Corto plazo:
- [ ] Añadir snackbar/toast para feedback de éxito/error
- [ ] Implementar edición de transacciones existentes
- [ ] Añadir confirmación antes de cerrar con cambios sin guardar

### Medio plazo:
- [ ] Soporte para transacciones recurrentes
- [ ] Adjuntar comprobantes (imágenes/PDF)
- [ ] Autocompletado de descripción basado en histórico
- [ ] Sugerencia de categoría basada en descripción

### Largo plazo:
- [ ] Plantillas de transacciones frecuentes
- [ ] Importación desde archivo CSV/OFX
- [ ] Reconocimiento OCR de tickets

---

## 📝 Notas Técnicas

### Suposiciones Declaradas:

1. **Endpoint de transacciones:** Se usa el existente `POST /api/transactions`
2. **Campo `transfer_account_id`:** Se asume que el backend lo soporta para transferencias
3. **Categorías universales:** No hay distinción especial para categorías de transferencia
4. **Formato de fecha:** ISO 8601 (YYYY-MM-DD)
5. **Campo `source`:** Fijo como "manual" según especificación

### Limitaciones Conocidas:

- No se modificó la lógica backend
- No se agregaron nuevos endpoints
- Las transferencias usan el mismo endpoint que transacciones regulares
- No hay validación de saldo disponible (cliente)

### Dependencias:

```json
{
  "@angular/material": "^21.0.5",
  "@angular/cdk": "^21.0.5",
  "@angular/forms": "^21.0.0"
}
```

---

## 🎨 Capturas de Diseño

### Modal - Modo Transacción
```
┌─────────────────────────────────────┐
│ Nueva Transacción             [×]   │
├─────────────────────────────────────┤
│ Cuenta: [Cuenta Corriente ▼]       │
│                                     │
│ Tipo de transacción *               │
│ [↑ Ingreso] [↓ Gasto]              │
│                                     │
│ Categoría: [Seleccionar ▼]         │
│ Descripción: [____________]         │
│ Importe: [____] Fecha: [____]      │
│                                     │
│ Etiquetas: [+ Agregar]             │
│ [chip1] [chip2]                    │
│                                     │
│ Notas: [______________]            │
│        [______________]            │
├─────────────────────────────────────┤
│              [Cancelar] [Guardar]   │
└─────────────────────────────────────┘
```

### Modal - Modo Transferencia
```
┌─────────────────────────────────────┐
│ Nueva Transferencia           [×]   │
├─────────────────────────────────────┤
│ Cuenta origen: [Cuenta 1 ▼]        │
│ Cuenta destino: [Cuenta 2 ▼]       │
│                                     │
│ Tipo: Transferencia (fijo)         │
│                                     │
│ Categoría: [Seleccionar ▼]         │
│ Descripción: [____________]         │
│ Importe: [____] Fecha: [____]      │
│                                     │
│ Notas: [______________]            │
├─────────────────────────────────────┤
│              [Cancelar] [Guardar]   │
└─────────────────────────────────────┘
```

---

## 🐛 Testing

### Casos de Prueba Recomendados:

1. ✅ Crear transacción desde account-detail con cuenta preseleccionada
2. ✅ Crear transacción desde /transactions sin preselección
3. ✅ Crear transferencia desde account-detail
4. ✅ Crear transferencia desde /transactions
5. ✅ Validar campos obligatorios
6. ✅ Validar que transfer_account_id ≠ account_id
7. ✅ Filtrado de categorías por tipo (ingreso/gasto)
8. ✅ Añadir/eliminar tags
9. ✅ Cancelar sin guardar
10. ✅ Submit con datos válidos

---

**Implementado por:** GitHub Copilot  
**Fecha:** 29/12/2025  
**Versión Angular:** 21.0.0  
**Versión Material:** 21.0.5
