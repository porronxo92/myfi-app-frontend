# 📡 Integración Backend - AppFinanzas

## Servicios Implementados

### 1. **AccountService** (`account.service.ts`)
Gestiona las cuentas bancarias del usuario.

#### Métodos disponibles:
- `getAccounts()`: Obtiene todas las cuentas del usuario
- `getAccountById(id)`: Obtiene una cuenta específica
- `createAccount(account)`: Crea una nueva cuenta
- `updateAccount(id, account)`: Actualiza una cuenta existente
- `deleteAccount(id)`: Elimina una cuenta

#### Signals reactivos:
- `accounts`: Array de cuentas del usuario
- `totalBalance`: Balance total de todas las cuentas activas
- `loading`: Estado de carga
- `error`: Mensaje de error (si existe)

#### Endpoint backend:
```
GET    /api/accounts          - Listar cuentas
GET    /api/accounts/:id      - Obtener cuenta
POST   /api/accounts          - Crear cuenta
PUT    /api/accounts/:id      - Actualizar cuenta
DELETE /api/accounts/:id      - Eliminar cuenta
```

---

### 2. **TransactionService** (`transaction.service.ts`)
Gestiona las transacciones (ingresos y gastos).

#### Métodos disponibles:
- `getTransactions(params?)`: Obtiene transacciones con filtros opcionales
  - `start_date`: Fecha inicio (YYYY-MM-DD)
  - `end_date`: Fecha fin (YYYY-MM-DD)
  - `account_id`: Filtrar por cuenta
  - `category_id`: Filtrar por categoría
- `getTransactionById(id)`: Obtiene una transacción específica
- `createTransaction(transaction)`: Crea una nueva transacción
- `updateTransaction(id, transaction)`: Actualiza una transacción
- `deleteTransaction(id)`: Elimina una transacción

#### Signals reactivos:
- `transactions`: Array de todas las transacciones
- `recentTransactions`: Últimas 5 transacciones ordenadas por fecha
- `monthlyIncome`: Total de ingresos del mes actual
- `monthlyExpenses`: Total de gastos del mes actual
- `loading`: Estado de carga
- `error`: Mensaje de error (si existe)

#### Endpoint backend:
```
GET    /api/transactions?start_date=X&end_date=Y  - Listar transacciones
GET    /api/transactions/:id                      - Obtener transacción
POST   /api/transactions                          - Crear transacción
PUT    /api/transactions/:id                      - Actualizar transacción
DELETE /api/transactions/:id                      - Eliminar transacción
```

---

### 3. **CategoryService** (`category.service.ts`)
Gestiona las categorías de transacciones.

#### Métodos disponibles:
- `getCategories()`: Obtiene todas las categorías del usuario
- `getCategoryById(id)`: Obtiene una categoría específica
- `createCategory(category)`: Crea una nueva categoría
- `updateCategory(id, category)`: Actualiza una categoría
- `deleteCategory(id)`: Elimina una categoría

#### Signals reactivos:
- `categories`: Array de todas las categorías
- `incomeCategories`: Categorías de tipo "income"
- `expenseCategories`: Categorías de tipo "expense"
- `loading`: Estado de carga
- `error`: Mensaje de error (si existe)

#### Endpoint backend:
```
GET    /api/categories        - Listar categorías
GET    /api/categories/:id    - Obtener categoría
POST   /api/categories        - Crear categoría
PUT    /api/categories/:id    - Actualizar categoría
DELETE /api/categories/:id    - Eliminar categoría
```

---

## Modelos de Datos

### Account
```typescript
interface Account {
  id: number;
  user_id: number;
  name: string;
  account_type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: number;
  account_id: number;
  category_id: number | null;
  amount: number;
  transaction_type: 'income' | 'expense';
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  account_name?: string;
}
```

### Category
```typescript
interface Category {
  id: number;
  user_id: number;
  name: string;
  category_type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}
```

---

## Uso en Componentes

### Ejemplo: Cargar datos en el Dashboard

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="accountService.loading()">Cargando...</div>
    
    <div *ngFor="let account of accountService.accounts()">
      {{ account.name }}: {{ account.balance }}
    </div>
    
    <p>Balance Total: {{ accountService.totalBalance() }}</p>
  `
})
export class DashboardComponent implements OnInit {
  accountService = inject(AccountService);
  transactionService = inject(TransactionService);

  ngOnInit() {
    // Cargar cuentas
    this.accountService.getAccounts().subscribe();

    // Cargar transacciones del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.transactionService.getTransactions({
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }).subscribe();
  }
}
```

---

## Estados de la Aplicación

### ✅ Estados de Carga
Todos los servicios tienen un signal `loading()` que indica si hay una petición en curso:

```typescript
<div *ngIf="accountService.loading()">
  <div class="spinner"></div>
  <p>Cargando cuentas...</p>
</div>
```

### ❌ Estados de Error
Todos los servicios tienen un signal `error()` que contiene el mensaje de error:

```typescript
<div *ngIf="accountService.error()" class="error">
  {{ accountService.error() }}
  <button (click)="accountService.getAccounts().subscribe()">
    Reintentar
  </button>
</div>
```

### 📭 Estados Vacíos
Mostrar mensaje cuando no hay datos:

```typescript
<div *ngIf="accountService.accounts().length === 0" class="empty">
  <p>No tienes cuentas registradas</p>
  <button (click)="openNewAccountModal()">Añadir cuenta</button>
</div>
```

---

## Próximas Implementaciones Necesarias

### Backend (FastAPI)
Asegúrate de que el backend tenga los siguientes endpoints implementados:

1. **Accounts API** (`/api/accounts`)
2. **Transactions API** (`/api/transactions`)
3. **Categories API** (`/api/categories`)

### Frontend
Funcionalidades pendientes:

- [ ] Modal para crear nueva cuenta
- [ ] Modal para crear nueva transacción
- [ ] Modal para crear nueva categoría
- [ ] Formularios de edición
- [ ] Confirmación de eliminación
- [ ] Filtros avanzados de transacciones
- [ ] Gráficos y estadísticas
- [ ] Exportación de datos

---

## Notas Técnicas

### Autenticación
Todos los servicios usan automáticamente el `AuthInterceptor` que:
- Añade el token JWT a cada petición
- Renueva automáticamente el token cuando expira (401)
- Redirige al login si la renovación falla

### Gestión de Estado
Los servicios usan **Signals** (Angular 21) para:
- Reactividad automática en los componentes
- Sin necesidad de subscripciones manuales
- Mejor rendimiento con `OnPush` change detection

### Actualización Automática
Los métodos de creación, actualización y eliminación:
- Actualizan automáticamente la lista después de la operación
- Recalculan totales y estadísticas
- No requiere recargar manualmente

---

## Troubleshooting

### Error: "Cannot read property 'subscribe' of undefined"
**Solución**: Asegúrate de que el backend esté corriendo en `http://localhost:8000`

### Error CORS
**Solución**: Verifica que el backend tenga configurado CORS para `http://localhost:4200`

### Los datos no se actualizan
**Solución**: Los signals son reactivos, asegúrate de usar `()` para accederlos:
```typescript
// ❌ Incorrecto
{{ accounts }}

// ✅ Correcto
{{ accounts() }}
```

### Token expirado
**Solución**: El interceptor lo renueva automáticamente. Si falla, cierra sesión y vuelve a entrar.
