# 🐳 Docker Deployment Guide - AppFinanzas Frontend

## 📋 Archivos Creados

✅ `Dockerfile` - Imagen multi-stage optimizada
✅ `nginx.conf` - Configuración NGINX para SPA
✅ `.dockerignore` - Excluir archivos innecesarios del build

## 🏗️ Construcción de la Imagen

### Construcción Local
```bash
# Navegar al directorio frontend
cd frontend

# Construir la imagen
docker build -t appfinanzas-frontend:latest .

# Con tag para GCP (opcional, usar tu PROJECT_ID)
docker build -t gcr.io/[PROJECT_ID]/appfinanzas-frontend:latest .
```

### Construcción Optimizada (más rápida en rebuild)
```bash
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t appfinanzas-frontend:latest .
```

## 🚀 Ejecución en Local

> **⚠️ IMPORTANTE:** El contenedor SIEMPRE escucha en el puerto **8080** internamente (requisito de Cloud Run).
> Para local, mapeamos `4200` (host) → `8080` (contenedor) para evitar conflictos con el backend.

### Modo Básico
```bash
docker run -d -p 4200:8080 --name frontend appfinanzas-frontend:latest
```

### Modo Desarrollo (con logs visibles)
```bash
docker run -p 4200:8080 --name frontend appfinanzas-frontend:latest
```

### Con Variables de Entorno (si las necesitas)
```bash
docker run -d -p 4200:8080 \
  -e API_URL=http://localhost:8080 \
  --name frontend \
  appfinanzas-frontend:latest
```

## ✅ Verificación Local

### 1. Verificar que el contenedor está corriendo
```bash
docker ps
```

### 2. URLs de Prueba

**Frontend Principal:**
http://localhost:4200

**Health Check:**
http://localhost:4200/health

**Probar rutas de Angular:**
- http://localhost:4200/accounts
- http://localhost:4200/dashboard
- http://localhost:4200/transactions

**Backend (si corre en paralelo):**
http://localhost:8080

### 3. Ver Logs
```bash
docker logs frontend

# Ver logs en tiempo real
docker logs -f frontend
```

### 4. Inspeccionar el Contenedor
```bash
# Ver estadísticas de recursos
docker stats frontend

# Acceder al shell del contenedor (debugging)
docker exec -it frontend sh
```

## 🧹 Limpieza

### Detener y Eliminar Contenedor
```bash
docker stop frontend
docker rm frontend
```

### Eliminar Imagen
```bash
docker rmi appfinanzas-frontend:latest
```

### Limpieza Completa (cuidado, elimina todo lo no usado)
```bash
docker system prune -a
```

## ☁️ Despliegue en Google Cloud Run

### 1. Autenticación en GCP
```bash
gcloud auth login
gcloud config set project [PROJECT_ID]
```

### 2. Configurar Docker para GCP
```bash
gcloud auth configure-docker
```

### 3. Build y Push a Google Container Registry
```bash
# Opción A: Build local y push
docker build -t gcr.io/[PROJECT_ID]/appfinanzas-frontend:latest .
docker push gcr.io/[PROJECT_ID]/appfinanzas-frontend:latest

# Opción B: Build directo en GCP (recomendado para producción)
gcloud builds submit --tag gcr.io/[PROJECT_ID]/appfinanzas-frontend:latest
```

### 4. Deploy a Cloud Run
```bash
gcloud run deploy appfinanzas-frontend \
  --image gcr.io/[PROJECT_ID]/appfinanzas-frontend:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300
```

### 5. Configurar Dominio Personalizado (con Cloudflare)

En Cloud Run Console:
1. Ir a "Manage Custom Domains"
2. Añadir tu dominio
3. Copiar registros DNS

En Cloudflare:
1. Añadir un CNAME apuntando a la URL de Cloud Run
2. Activar Proxy (nube naranja) para SSL/CDN
3. SSL/TLS > Full (strict)

## 📊 Monitoreo y Logs en Cloud Run

### Ver Logs
```bash
gcloud run services logs read appfinanzas-frontend --limit=50
```

### Ver Métricas
```bash
gcloud run services describe appfinanzas-frontend
```

## 🔧 Troubleshooting

### El contenedor no inicia
```bash
# Ver logs de error
docker logs frontend

# Verificar que el build completó correctamente
docker history appfinanzas-frontend:latest
```

### Error 404 en rutas de Angular
- ✅ Verificar que nginx.conf tiene `try_files $uri $uri/ /index.html;`
- ✅ Verificar que los archivos están en `/usr/share/nginx/html`

### Assets no se cargan
```bash
# Verificar archivos dentro del contenedor
docker exec frontend ls -la /usr/share/nginx/html
```

### Error de permisos
```bash
# Verificar que el usuario nginx tiene permisos
docker exec frontend ls -l /usr/share/nginx/html
```

### Puerto 4200 ya en uso
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :4200  # Windows
lsof -i :4200                  # Linux/Mac

# Usar otro puerto local (el contenedor siempre usa 8080 internamente)
docker run -p 3000:8080 --name frontend appfinanzas-frontend:latest
# Accederías entonces en http://localhost:3000
```

## 📦 Tamaño de la Imagen

### Verificar tamaño
```bash
docker images appfinanzas-frontend:latest
```

**Tamaño esperado:** ~50-80 MB (NGINX Alpine + build Angular)

### Optimizar aún más
```bash
# Habilitar BuildKit
export DOCKER_BUILDKIT=1
docker build -t appfinanzas-frontend:latest .
```

## 🔐 Seguridad

### Escanear vulnerabilidades
```bash
# Con Docker Scout
docker scout cves appfinanzas-frontend:latest

# Con Trivy
trivy image appfinanzas-frontend:latest
```

### Mejores Prácticas Implementadas
- ✅ Usuario no-root (nginx)
- ✅ Imagen base Alpine (mínima superficie de ataque)
- ✅ Multi-stage build (no expone código fuente)
- ✅ Health checks configurados
- ✅ Headers de seguridad en NGINX
- ✅ Server tokens desactivados

## 📝 Variables de Entorno (si las necesitas en el futuro)

Si tu app necesita variables de entorno en runtime, modifica `nginx.conf` para usar `envsubst`:

```dockerfile
# En Dockerfile, antes del CMD
RUN apk add --no-cache gettext
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/config.template.json > /usr/share/nginx/html/assets/config.json && nginx -g 'daemon off;'"]
```

## 🎯 Checklist de Despliegue

### Pre-Deploy
- [ ] Código commiteado en Git
- [ ] Tests pasando
- [ ] Build sin errores
- [ ] Variables de entorno configuradas

### Deploy Local
- [ ] Imagen construida exitosamente
- [ ] Contenedor iniciado
- [ ] Health check responde 200
- [ ] Frontend carga correctamente
- [ ] Rutas de Angular funcionan

### Deploy Cloud Run
- [ ] Imagen pusheada a GCR
- [ ] Servicio desplegado
- [ ] URL pública accesible
- [ ] Custom domain configurado
- [ ] SSL activo (Cloudflare)
- [ ] Logs sin errores

## 📞 Soporte

Si encuentras problemas, verifica:
1. Logs del contenedor
2. Configuración de nginx.conf
3. Permisos de archivos
4. Puerto interno 8080 (no modificable, requerido por Cloud Run)
5. Mapeo de puertos local: `-p 4200:8080` para evitar conflicto con backend
6. Build de Angular completado correctamente

---

**Última actualización:** Marzo 2026
**Angular Version:** 21.0.0
**Node Version:** 20 Alpine
**NGINX Version:** 1.27 Alpine
