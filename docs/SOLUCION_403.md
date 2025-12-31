# 🔧 Solución: Error 403 Forbidden

## Problema Identificado

El error **403 (Forbidden)** ocurría porque el servicio de autenticación no estaba **cargando el token desde localStorage** cuando la aplicación se recargaba.

### Causa Raíz
El `AuthService` guardaba correctamente el token al hacer login, pero cuando se refrescaba la página:
1. El constructor se ejecutaba
2. Los signals se inicializaban **vacíos**
3. El token **NO se restauraba** desde localStorage
4. Las peticiones se enviaban **sin token** → 403 Forbidden

---

## Soluciones Aplicadas

### ✅ 1. Restaurar Sesión desde localStorage

**Archivo modificado**: `auth.service.ts`

**Cambios**:
```typescript
// ANTES (constructor)
constructor(private http: HttpClient, private router: Router) {
  this.updateAuthenticationState();
}

// AHORA (constructor con carga de datos)
constructor(private http: HttpClient, private router: Router) {
  this.loadFromStorage();  // ← NUEVO
  this.updateAuthenticationState();
}

// NUEVO MÉTODO
private loadFromStorage(): void {
  const accessToken = this.getAccessToken();
  const user = this.getUserFromStorage();

  if (accessToken && user) {
    this.accessTokenSignal.set(accessToken);
    this.userSignal.set(user);
    console.log('✅ Sesión restaurada desde localStorage:', user.email);
  } else {
    console.log('ℹ️ No hay sesión guardada en localStorage');
  }
}
```

**Resultado**: Ahora al recargar la página:
- Se lee el `access_token` de localStorage
- Se actualiza el signal `accessTokenSignal`
- El interceptor tiene acceso al token
- Las peticiones se envían correctamente con el header `Authorization: Bearer {token}`

---

### ✅ 2. Logs Mejorados en el Interceptor

**Archivo modificado**: `auth.interceptor.ts`

**Cambios**:
```typescript
if (accessToken && !isPublicEndpoint(req.url)) {
  authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  console.log(`🔐 Añadiendo token a petición: ${req.method} ${req.url}`);
  console.log(`Token: ${accessToken.substring(0, 20)}...`);
} else if (!accessToken && !isPublicEndpoint(req.url)) {
  console.warn(`⚠️ No hay token disponible para: ${req.method} ${req.url}`);
}
```

**Beneficios**:
- Visibilidad de qué peticiones llevan token
- Fácil debugging en consola
- Alertas cuando falta el token

---

### ✅ 3. Modal para Crear Cuentas

**Nuevo archivo**: `create-account-modal.component.ts`

**Funcionalidad**:
- Modal standalone (Angular 21)
- Formulario reactivo con validación
- Campos:
  - Nombre de la cuenta *
  - Tipo de cuenta * (Corriente, Ahorro, Crédito, etc.)
  - Balance inicial *
  - Moneda (EUR, USD, GBP)
- Estados de loading/error
- Cierre con overlay o botón X
- Emite evento al crear cuenta exitosamente

**Integración en Dashboard**:
```typescript
// Signal para controlar visibilidad
showAccountModal = signal(false);

// Abrir modal
openNewAccountModal(): void {
  this.showAccountModal.set(true);
}

// Cerrar modal
closeAccountModal(): void {
  this.showAccountModal.set(false);
}

// Recargar datos cuando se crea cuenta
onAccountCreated(): void {
  console.log('✅ Cuenta creada, recargando datos...');
  this.loadData();
}
```

**En el template**:
```html
<app-create-account-modal
  *ngIf="showAccountModal()"
  (closeModal)="closeAccountModal()"
  (accountCreated)="onAccountCreated()"
></app-create-account-modal>
```

---

## Cómo Probar

### 1. Reiniciar Frontend
```bash
# Si el servidor está corriendo, detenerlo y reiniciar
Ctrl + C
cd frontend
ng serve
```

### 2. Probar el Flujo Completo

#### Paso 1: Login
1. Ir a `http://localhost:4200/login`
2. Ingresar credenciales válidas
3. Click en "Iniciar Sesión"
4. **Verificar en consola**: `✅ Autenticación exitosa`
5. Redirige a `/dashboard`

#### Paso 2: Verificar Restauración de Sesión
1. Estando en el dashboard, **recargar la página** (F5)
2. **Verificar en consola**:
   ```
   ✅ Sesión restaurada desde localStorage: usuario@email.com
   ```
3. **NO debe redirigir al login**
4. **NO deben aparecer errores 403**

#### Paso 3: Verificar Peticiones con Token
Abrir DevTools → Network Tab:

1. Buscar petición: `GET http://localhost:8000/api/accounts`
2. Click en la petición → Headers tab
3. **Verificar**:
   ```
   Request Headers:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Status**: 200 OK (no 403)

#### Paso 4: Crear Primera Cuenta
1. En el dashboard (sección "Mis Cuentas")
2. Click en botón "**Añadir cuenta**" (borde discontinuo)
3. Se abre modal "Nueva Cuenta"
4. Rellenar:
   - Nombre: "Cuenta Corriente BBVA"
   - Tipo: "Cuenta Corriente"
   - Balance: 1000.00
   - Moneda: EUR
5. Click "Crear Cuenta"
6. **Verificar**:
   - Modal se cierra
   - Aparece notificación de éxito en consola
   - La cuenta aparece en el grid

#### Paso 5: Verificar Datos en Dashboard
Si todo funciona correctamente, deberías ver:

**KPI Cards**:
- Balance Total: €1,000.00
- Ingresos (Mes): €0.00
- Gastos (Mes): €0.00

**Mis Cuentas**:
- Tarjeta con "Cuenta Corriente BBVA"
- Balance: €1,000.00

---

## Solución de Problemas

### ❌ Sigue apareciendo 403
**Posible causa**: Backend no reconoce el token

1. Verificar que el backend esté corriendo: `http://localhost:8000/docs`
2. En el dashboard, abrir consola y buscar:
   ```
   🔐 Añadiendo token a petición: GET http://localhost:8000/api/accounts
   Token: eyJhbGciOiJIUzI1...
   ```
3. Copiar el token (completo, no solo los primeros 20 caracteres)
4. Ir a `http://localhost:8000/docs`
5. Click en "Authorize" (candado verde arriba a la derecha)
6. Pegar token en formato: `Bearer {token_copiado}`
7. Probar endpoint `/api/accounts` → GET
8. Si devuelve 403: El problema está en el backend (revisar dependencia `get_current_user`)

### ❌ Modal no aparece
**Solución**:
1. Verificar en consola: `showAccountModal: true`
2. Verificar importación en dashboard:
   ```typescript
   import { CreateAccountModalComponent } from '../../shared/components/create-account-modal.component';
   ```
3. Verificar en `imports: [CommonModule, CreateAccountModalComponent]`

### ❌ Error al crear cuenta
**Posible causa**: Endpoint del backend no existe o tiene error

1. Verificar que el backend tenga implementado:
   ```
   POST /api/accounts
   ```
2. Revisar el modelo en backend:
   ```python
   class AccountCreate(BaseModel):
       name: str
       account_type: str
       balance: float
       currency: str = "EUR"
   ```
3. Verificar logs del backend en la terminal

---

## Resumen de Archivos Modificados

### Frontend

**Modificados**:
- `auth.service.ts` → Carga token desde localStorage
- `auth.interceptor.ts` → Logs mejorados
- `dashboard.component.ts` → Integración modal, signals para modales

**Creados**:
- `create-account-modal.component.ts` → Modal standalone para crear cuentas

---

## Próximos Pasos Recomendados

1. ✅ **Probar flujo login → reload → peticiones con token**
2. ✅ **Crear al menos una cuenta de prueba**
3. 🔜 **Implementar modal de crear transacción** (similar al de cuentas)
4. 🔜 **Añadir validación de formularios más robusta**
5. 🔜 **Implementar CRUD completo**: editar y eliminar cuentas

---

## Verificación Final

Antes de dar por solucionado, confirma:

- [ ] Login funciona correctamente
- [ ] Al recargar página, sesión se mantiene (no redirige a /login)
- [ ] Consola muestra: `✅ Sesión restaurada desde localStorage`
- [ ] Peticiones a `/api/accounts`, `/api/transactions`, `/api/categories` → **200 OK**
- [ ] No aparecen errores 403 en Network tab
- [ ] Modal de crear cuenta se abre correctamente
- [ ] Se puede crear una cuenta nueva y aparece en el listado
- [ ] Estados vacíos muestran botón "Crear primera cuenta/transacción"

---

Si después de estos cambios sigues teniendo errores 403, el problema está en el **backend**. Avísame para revisar:
- Las rutas y sus dependencias de autenticación
- El método `get_current_user`
- La configuración de JWT en el backend
