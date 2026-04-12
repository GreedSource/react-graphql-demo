# ──────────────────────────────────────────────
# Etapa 1: Build con Bun
# ──────────────────────────────────────────────
FROM oven/bun:1.1.13-slim AS builder

ARG VITE_APP_NAME
ARG VITE_INDEXED_DB_NAME
ARG VITE_CRYPTO_SECRET
ARG VITE_GRAPHQL_ENDPOINT

ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_INDEXED_DB_NAME=$VITE_INDEXED_DB_NAME \
    VITE_CRYPTO_SECRET=$VITE_CRYPTO_SECRET \
    VITE_GRAPHQL_ENDPOINT=$VITE_GRAPHQL_ENDPOINT \
    NODE_ENV=production

WORKDIR /app

# 1. Copiar solo lockfile + package.json para aprovechar cache de layers
COPY bun.lock package.json ./

# 2. Instalar solo dependencias (cacheable si package.json no cambia)
RUN bun install --frozen-lockfile --production=false

# 3. Copiar resto de archivos fuente
COPY . .

# 4. Build con TypeScript + Vite
RUN bun run build

# ──────────────────────────────────────────────
# Etapa 2: Producción con Nginx optimizado
# ──────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Seguridad: ejecutar como usuario no-root
RUN addgroup -g 1001 -S nginx-nonroot && \
    adduser -S -D -H -u 1001 -G nginx-nonroot nginx-nonroot

# Config Nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Ajustar permisos
RUN chown -R nginx-nonroot:nginx-nonroot /usr/share/nginx/html && \
    chown -R nginx-nonroot:nginx-nonroot /var/cache/nginx && \
    chown -R nginx-nonroot:nginx-nonroot /var/log/nginx && \
    chown -R nginx-nonroot:nginx-nonroot /etc/nginx/conf.d && \
    touch /run/nginx.pid && \
    chown -R nginx-nonroot:nginx-nonroot /run/nginx.pid

USER nginx-nonroot

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
