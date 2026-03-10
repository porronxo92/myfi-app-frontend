# ============================================================================
# STAGE 1: Build Angular Application
# ============================================================================
FROM node:20-alpine AS builder

# Metadatos de la imagen
LABEL maintainer="AppFinanzas Team"
LABEL description="Angular Frontend - Build Stage"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalar TODAS las dependencias (incluye devDependencies necesarias para el build)
# npm ci: Instalación limpia desde package-lock.json (más rápido y determinista)
RUN npm i --silent && npm ci --silent && npm cache clean --force

# Copiar el código fuente del proyecto
COPY . .

# Compilar la aplicación Angular en modo producción
# --configuration=production: Optimizaciones (minificación, tree-shaking, AOT)
# El output irá a /app/dist/finanzas-app según angular.json
RUN npm run build

# ============================================================================
# STAGE 2: Servir con NGINX
# ============================================================================
FROM nginx:1.27-alpine

# Metadatos de la imagen final
LABEL maintainer="AppFinanzas Team"
LABEL description="Angular Frontend served by NGINX - Production Ready"
LABEL version="1.0.0"

# Instalar dumb-init para manejo correcto de señales en containers
RUN apk add --no-cache dumb-init

# Eliminar configuración default de NGINX
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada de NGINX
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados desde el stage anterior
# Fuente: /app/dist/finanzas-app (outputPath de angular.json)
# Destino: /usr/share/nginx/html (directorio por defecto de NGINX)
COPY --from=builder /app/dist/finanzas-app/browser /usr/share/nginx/html

# Crear directorios necesarios para NGINX con permisos apropiados
# /tmp ya existe y nginx tiene permisos de escritura
RUN mkdir -p /var/cache/nginx /var/log/nginx \
    /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp \
    /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx \
    /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp \
    /tmp/uwsgi_temp /tmp/scgi_temp && \
    chmod -R 755 /var/cache/nginx /var/log/nginx && \
    touch /tmp/nginx.pid && \
    chown nginx:nginx /tmp/nginx.pid

# Ajustar permisos de archivos estáticos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Cloud Run requiere que el contenedor escuche en el puerto 8080
# No usar 80 para compatibilidad con Cloud Run sin privilegios root
EXPOSE 8080

# Cambiar a usuario no-root por seguridad (mejores prácticas)
USER nginx

# Health check para Docker y orchestrators
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Usar dumb-init para manejo correcto de señales SIGTERM
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Iniciar NGINX en modo foreground (daemon off)
CMD ["nginx", "-g", "daemon off;"]
