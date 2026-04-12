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

# Config SPA
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build estático
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
