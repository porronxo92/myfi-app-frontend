# 🚀 Script de Inicio Rápido - Finanzas Personal

## ⚡ Quick Start

### 1. Instalar dependencias (solo primera vez)
```bash
npm install
```

### 2. Iniciar aplicación
```bash
npm start
```

**URL:** http://localhost:4200

---

## 🧪 Test Rápido del Sistema

### Opción 1: Crear nuevo usuario

1. Ve a http://localhost:4200
2. Haz clic en "Regístrate aquí"
3. Completa el formulario:
   - Email: `test@example.com`
   - Password: `Test123!`
   - (Campos opcionales: username, full_name)
4. Haz clic en "Crear Cuenta"
5. Serás redirigido al login
6. Inicia sesión con las mismas credenciales
7. Deberías ver el Dashboard ✅

### Opción 2: Usar usuario existente del backend

Si ya ejecutaste el script `backend/reset_password.py`:

```
Email: user@example.com
Password: User123!
```

---

## 📊 Verificar que Todo Funciona

### ✅ Checklist de Pruebas

1. **Login exitoso**: ✅
   - Login con credenciales correctas → Dashboard
   
2. **Login fallido**: ✅
   - Login con credenciales incorrectas → Error "Email o contraseña incorrectos"
   - Después de 5 intentos → Error "Demasiados intentos"
   
3. **Guards funcionando**: ✅
   - Intenta ir a http://localhost:4200/dashboard sin login → Redirige a /login
   - Después de login, intenta ir a /login → Redirige a /dashboard
   
4. **Persistencia**: ✅
   - Haz login
   - Cierra el navegador
   - Vuelve a abrir http://localhost:4200
   - Deberías seguir logueado (localStorage mantiene tokens)
   
5. **Logout**: ✅
   - Haz clic en "Cerrar Sesión"
   - Deberías volver a /login
   - Tokens eliminados de localStorage

---

## 🔍 Debugging en DevTools

### Ver tokens guardados

1. Abre DevTools (F12)
2. Ve a pestaña "Application"
3. En el sidebar, expande "Local Storage"
4. Haz clic en "http://localhost:4200"
5. Deberías ver:
   - `access_token`: Token JWT (expira en 30 min)
   - `refresh_token`: Token JWT (expira en 7 días)
   - `user`: JSON con datos del usuario

### Ver peticiones HTTP

1. Abre DevTools (F12)
2. Ve a pestaña "Network"
3. Haz login
4. Deberías ver:
   - POST `/api/users/login` → Status 200
   - Response: `{ access_token, refresh_token, user, ... }`
5. Haz clic en la petición
6. Ve a "Headers" → Verás el Request/Response completo

### Verificar interceptor

1. Network → Filter: "Fetch/XHR"
2. Cualquier petición a `/api/...` debe tener header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```
3. Esto lo añade automáticamente el `authInterceptor`

---

## 🐛 Errores Comunes y Soluciones

### Error: "Cannot connect to backend"

**Causa:** Backend no está corriendo

**Solución:**
```bash
# En otra terminal
cd backend
python -m app.main
```

Verifica que esté en http://localhost:8000

---

### Error: CORS policy

**Causa:** Backend no tiene configurado CORS para localhost:4200

**Solución:**

Verifica `backend/.env`:
```bash
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
```

Reinicia el backend después de cambiar.

---

### Error: "Email o contraseña incorrectos"

**Causa:** Usuario no existe o contraseña incorrecta

**Solución:**

Opción 1 - Resetear contraseña del usuario existente:
```bash
cd backend
python reset_password.py
# Sigue las instrucciones
```

Opción 2 - Registrar nuevo usuario desde el frontend:
- Ve a /register
- Crea una cuenta nueva

---

### Error: "Port 4200 is already in use"

**Causa:** Ya hay otro proceso usando el puerto 4200

**Solución:**
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# O usa otro puerto
ng serve --port 4201
```

---

## 📝 Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm start

# Build para producción
npm run build

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Angular
ng version
```

---

## 🎉 ¡Listo!

Si lograste hacer login y ver el Dashboard, el MVP de autenticación está **100% funcional**.

**Siguiente paso:** Implementar el Dashboard con datos reales (cuentas, transacciones, etc.)
