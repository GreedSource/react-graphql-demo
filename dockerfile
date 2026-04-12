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

# 1. Copiar lockfile + package.json (cache de dependencias)
COPY bun.lock package.json ./
RUN bun install

# 2. Copiar fuentes y construir
COPY . .
RUN bun run build

# ──────────────────────────────────────────────
# Etapa 2: Producción con Nginx
# ──────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Usuario no-root para producción segura
RUN addgroup -g 1001 -S nginx-nonroot && \
    adduser -S -D -H -u 1001 -G nginx-nonroot nginx-nonroot

# Config SPA
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Permisos
RUN chown -R nginx-nonroot:nginx-nonroot \
    /usr/share/nginx/html \
    /var/cache/nginx \
    /var/log/nginx \
    /etc/nginx/conf.d && \
    touch /run/nginx.pid && \
    chown nginx-nonroot:nginx-nonroot /run/nginx.pid

USER nginx-nonroot

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
