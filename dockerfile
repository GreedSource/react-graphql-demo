# Etapa 1: Build con Bun
FROM oven/bun:1.1.13 as builder

# Recibir args
ARG VITE_APP_NAME
ARG VITE_INDEXED_DB_NAME
ARG VITE_CRYPTO_SECRET
ARG VITE_GRAPHQL_ENDPOINT

# Pasar args como variables de entorno para Vite
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_INDEXED_DB_NAME=$VITE_INDEXED_DB_NAME
ENV VITE_CRYPTO_SECRET=$VITE_CRYPTO_SECRET
ENV VITE_GRAPHQL_ENDPOINT=$VITE_GRAPHQL_ENDPOINT

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias
RUN bun install

# Construir proyecto Vite
RUN bun run build

# Etapa 2: Servir con un servidor estático como nginx o Bun (opcional)
# Usaremos nginx para producción

FROM nginx:stable-alpine as production

# Copiar archivos estáticos de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Eliminar configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Agregar configuración custom para SPA
COPY nginx.conf /etc/nginx/conf.d

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
