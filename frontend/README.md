# 💰 Finanzas Personal - Frontend MVP

## 🎯 Tecnologías

- **Angular 21** (Standalone Components)
- **TypeScript 5.6** (Strict mode)
- **RxJS 7.8** + **Signals** (Estado reactivo)
- **SCSS** (Estilos)
- **JWT Authentication** (Access + Refresh tokens)

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                          # Servicios singleton, guards, interceptores
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Protege rutas privadas
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Añade JWT automático + auto-refresh
│   │   ├── models/
│   │   │   └── user.model.ts          # Interfaces TypeScript
│   │   └── services/
│   │       └── auth.service.ts        # Lógica de autenticación (Signals)
│   │
│   ├── features/                      # Módulos funcionales
│   │   ├── auth/
│   │   │   ├── login/                 # Login component
│   │   │   └── register/              # Registro component
│   │   └── dashboard/                 # Dashboard protegido
│   │
│   ├── app.component.ts               # Root component
│   ├── app.config.ts                  # Configuración (providers)
│   └── app.routes.ts                  # Definición de rutas
│
├── environments/
│   ├── environment.ts                 # Config desarrollo
│   └── environment.prod.ts            # Config producción
│
└── styles.scss                        # Estilos globales
```

---

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Iniciar aplicación (desarrollo)

```bash
npm start
```

La aplicación estará disponible en: **http://localhost:4200**

---

## 🔐 Flujo de Autenticación Implementado

### 1️⃣ Usuario NO autenticado

```
http://localhost:4200/
    ↓
authGuard detecta que NO hay token
    ↓
Redirige a /login
```

### 2️⃣ Login exitoso

```
Usuario ingresa credenciales en /login
    ↓
authService.login() llama a POST /api/users/login
    ↓
Backend devuelve:
  - access_token (30 min)
  - refresh_token (7 días)
  - user data
    ↓
authService guarda en localStorage:
  - access_token
  - refresh_token
  - user (JSON)
    ↓
Actualiza Signals (estado reactivo)
    ↓
Redirige a /dashboard
```

### 3️⃣ Peticiones a la API

```
Component necesita datos → llama a un servicio
    ↓
authInterceptor intercepta TODAS las peticiones HTTP
    ↓
Añade header automáticamente:
  Authorization: Bearer {access_token}
    ↓
Envía petición al backend
    ↓
Si 401 (token expirado):
  ↓
  authInterceptor llama a POST /api/users/refresh
  ↓
  Obtiene nuevo access_token
  ↓
  Reintenta petición original automáticamente
```

### 4️⃣ Logout

```
Usuario hace clic en "Cerrar Sesión"
    ↓
authService.logout()
    ↓
Elimina:
  - access_token
  - refresh_token
  - user
de localStorage
    ↓
Resetea Signals
    ↓
Redirige a /login
```

---

## 🛡️ Seguridad Implementada

### ✅ Guards

- **`authGuard`**: Protege rutas que requieren autenticación (Dashboard, Cuentas, etc.)
- **`publicGuard`**: Evita que usuarios autenticados vean Login/Register (los redirige al Dashboard)

### ✅ Interceptor HTTP

- Añade `Authorization: Bearer {token}` automáticamente
- **Auto-refresh**: Si el `access_token` expira (401), renueva automáticamente con `refresh_token`
- Si el `refresh_token` también expiró, cierra sesión y redirige a login

### ✅ Signals (Estado Reactivo)

- `user()`: Signal de solo lectura con datos del usuario
- `isAuthenticated()`: Computed signal que detecta automáticamente si hay sesión
- Actualización automática en toda la app cuando cambia el estado

### ✅ TypeScript Estricto

- Tipos definidos para TODAS las interfaces (User, LoginRequest, TokenResponse, etc.)
- Coinciden exactamente con los schemas de Pydantic del backend
- Sin `any` en ninguna parte

---

## 🧪 Cómo Probar

### Paso 1: Verificar que el backend está corriendo

```bash
# En otra terminal
cd backend
python -m app.main
```

Backend debe estar en: **http://localhost:8000**

### Paso 2: Iniciar frontend

```bash
cd frontend
npm start
```

Frontend en: **http://localhost:4200**

### Paso 3: Probar flujo completo

1. **Registro:**
   - Ve a http://localhost:4200 (redirige a /login)
   - Haz clic en "Regístrate aquí"
   - Completa el formulario:
     - Email: `test@example.com`
     - Password: `Test123!` (debe tener mayúscula, minúscula y número)
   - Haz clic en "Crear Cuenta"
   - Deberías ver mensaje de éxito y redirección a login

2. **Login:**
   - Ingresa las mismas credenciales
   - Email: `test@example.com`
   - Password: `Test123!`
   - Haz clic en "Iniciar Sesión"
   - Deberías ser redirigido a /dashboard

3. **Dashboard (Protegido):**
   - Verás información del usuario
   - Si cierras el navegador y vuelves a entrar, seguirás autenticado (tokens en localStorage)

4. **Logout:**
   - Haz clic en "🚪 Cerrar Sesión"
   - Deberías volver a /login
   - Los tokens se eliminan de localStorage

### Paso 4: Probar auto-refresh (avanzado)

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Network"
3. Haz login
4. Espera 30 minutos (o cambia en backend `JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1` para probar en 1 minuto)
5. Intenta hacer una petición (cuando implementemos más features)
6. En Network verás:
   - Primera petición: 401 Unauthorized
   - Segunda petición: POST /api/users/refresh (automática)
   - Tercera petición: Reintento de la primera (con nuevo token) ✅

---

## 📝 Usuarios de Prueba (Backend)

Si ya tienes usuarios creados en el backend:

```
Email: user@example.com
Password: User123!

Email: admin@example.com
Password: Admin123!
```

*(Usa el script `backend/reset_password.py` si olvidaste las contraseñas)*

---

## 🔧 Configuración de Entornos

### Desarrollo (src/environments/environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  apiBaseUrl: 'http://localhost:8000'
};
```

### Producción (src/environments/environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.com/api',
  apiBaseUrl: 'https://tu-dominio.com'
};
```

Para producción, ejecuta:

```bash
npm run build
# Los archivos compilados estarán en dist/finanzas-app/
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@angular/...'"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: CORS en el navegador

Verifica que el backend tenga configurado CORS para `http://localhost:4200`:

```python
# backend/.env
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
```

### Error 401 inmediato después de login

- Verifica que las claves JWT sean las mismas en backend y frontend
- Revisa las DevTools → Application → LocalStorage → Debe haber `access_token`

### Los guards no funcionan

- Verifica que `app.config.ts` tenga `provideRouter(routes)`
- Verifica que `app.routes.ts` use `canActivate: [authGuard]`

---

## 📦 Scripts Disponibles

```bash
npm start          # Inicia dev server (http://localhost:4200)
npm run build      # Build para producción
npm run watch      # Build en modo watch
```

---

## ✅ Checklist - Lo que YA funciona

- [x] Setup completo de Angular 21
- [x] Standalone components (sin NgModules)
- [x] Autenticación JWT (access + refresh tokens)
- [x] Guards funcionales (authGuard, publicGuard)
- [x] Interceptor HTTP con auto-refresh
- [x] Login component con validación
- [x] Register component
- [x] Dashboard protegido
- [x] Signals para estado reactivo
- [x] TypeScript estricto
- [x] Estilos responsive
- [x] Manejo de errores HTTP
- [x] LocalStorage para persistencia

## 🚧 Próximos Pasos (Fase 2)

- [ ] Gestión de Cuentas (CRUD)
- [ ] Gestión de Transacciones (CRUD + filtros)
- [ ] Gestión de Categorías (CRUD)
- [ ] Upload de extractos (PDF/Excel)
- [ ] Dashboard con gráficos (Chart.js / ApexCharts)
- [ ] Forgot Password (reset por email)

---

**🎉 ¡MVP de Autenticación Completo!**

El sistema de autenticación está 100% funcional y listo para agregar nuevas features.
