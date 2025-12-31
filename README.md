# 💰 Finanzas Personal

> Aplicación web para gestión de finanzas personales con Angular 21

## ✨ Características

- 🔐 **Autenticación segura** con JWT (access + refresh tokens)
- 📊 **Dashboard** con resumen financiero y gráficos interactivos
- 💳 **Gestión de cuentas** bancarias (crear, editar, eliminar)
- 💸 **Gestión de transacciones** con filtros avanzados y categorización automática
- 📁 **Importación de extractos** bancarios
- 🎨 **Temas** claro y oscuro
- 📱 **Diseño responsive** para móviles y tablets
- 🔒 **Auto-logout** por inactividad

## 🚀 Tecnologías

- **Angular 21** con Standalone Components
- **TypeScript 5.9** en modo estricto
- **Angular Material 21** para UI/UX
- **Chart.js** para visualización de datos
- **RxJS 7.8** y **Signals** para gestión de estado reactivo

## 📦 Instalación

```bash
npm install
```

## 🏃 Ejecución

### Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Producción

```bash
npm run build
```

## 🔧 Configuración

Edita los archivos de entorno en `src/environments/`:

- `environment.ts` - Desarrollo
- `environment.prod.ts` - Producción

## 📝 Scripts Disponibles

- `npm start` - Inicia servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run watch` - Construye en modo watch
- `npm run start:lan` - Inicia servidor accesible desde la red local

## 🛡️ Seguridad

- Guards de autenticación para rutas protegidas
- Interceptor HTTP con renovación automática de tokens
- Timeout de sesión por inactividad
- Gestión segura de credenciales

## 📄 Licencia

MIT
