# 🚀 Quick Start - Docker Frontend

## Comandos para Ejecutar Localmente

### 1️⃣ Construir la imagen
```bash
cd frontend
docker build -t appfinanzas-frontend:latest .
```

### 2️⃣ Ejecutar el contenedor
```bash
docker run -d -p 4200:8080 --name frontend appfinanzas-frontend:latest
```

> **📌 Nota:** El contenedor siempre escucha en puerto **8080** internamente (requisito de Cloud Run).
> Usamos `-p 4200:8080` para evitar conflicto con el backend que corre en 8080.

### 3️⃣ Verificar que funciona
- **Frontend:** http://localhost:4200
- **Health Check:** http://localhost:4200/health
- **Dashboard:** http://localhost:4200/dashboard
- **Backend (en paralelo):** http://localhost:8080

### 4️⃣ Ver logs
```bash
docker logs -f frontend
```

### 5️⃣ Detener y limpiar
```bash
docker stop frontend
docker rm frontend
```

---

## Arquitectura de Puertos

```
┌─────────────────────────────────────────────────┐
│  TU MÁQUINA LOCAL                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend (Docker)                              │
│  localhost:4200 ───► puerto 8080 (contenedor)  │
│                                                 │
│  Backend                                        │
│  localhost:8080                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│  CLOUD RUN (PRODUCCIÓN)                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend Container: puerto 8080 (obligatorio)  │
│  Backend Container: puerto 8080 (obligatorio)   │
│                                                 │
│  Cloudflare maneja el routing entre servicios  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ Importante

- **NO modificar el puerto 8080 en Dockerfile/nginx.conf** → Cloud Run lo requiere
- **Para local:** Usa `-p <CUALQUIER_PUERTO>:8080` para mapear al puerto que quieras
- **Ejemplos de mapeo:**
  - `-p 4200:8080` → Acceso en http://localhost:4200
  - `-p 3000:8080` → Acceso en http://localhost:3000
  - `-p 5000:8080` → Acceso en http://localhost:5000

---

Para más detalles, ver: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
