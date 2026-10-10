# React GraphQL Admin

Dashboard administrativo para gestionar usuarios, roles y permisos mediante una API GraphQL. Incluye autenticación, control de acceso basado en roles (RBAC) e impersonación temporal de usuarios.

## Funciones

- Inicio de sesión, registro, recuperación y restablecimiento de contraseña, y cambio de contraseña.
- Administración de usuarios y asignación de roles.
- Administración del catálogo RBAC: roles, módulos, acciones y permisos.
- Protección de rutas y acciones de interfaz según permisos.
- Impersonación temporal desde el catálogo de usuarios, sujeta al permiso `users.impersonate`.
- Banner persistente mientras se impersona, con la identidad activa y la acción **Regresar a mi cuenta**.
- Actualización automática de tokens y restauración de la sesión original al terminar la impersonación.
- Tema claro/oscuro, notificaciones y suscripciones GraphQL por WebSocket.

Al impersonar, la aplicación opera con el usuario objetivo y sus permisos y asignaciones. La sesión del administrador se conserva para volver a ella. No se permite impersonar la propia cuenta, usuarios inactivos ni iniciar una impersonación anidada.

## Tecnologías

- React 19, TypeScript y Vite 7
- Apollo Client 3 y `graphql-ws`
- Material UI 7 y Tailwind CSS 4
- Zustand 5 con persistencia cifrada en IndexedDB
- React Router DOM 7 y `react-toastify`
- Bun (recomendado)

## Requisitos y configuración

- Bun o Node.js 18 o posterior
- Una instancia accesible de la API GraphQL

Copia `.env.example` a `.env` y configura:

```env
VITE_APP_NAME=<nombre_de_la_aplicacion>
VITE_GRAPHQL_ENDPOINT=<url_http_de_graphql>
VITE_INDEXEDDB_DB_NAME=<nombre_de_base_indexeddb>
VITE_CRYPTO_SECRET=<secreto_para_cifrar_persistencia>
```

El cliente deriva la URL WebSocket desde `VITE_GRAPHQL_ENDPOINT`, convirtiendo `http` en `ws` o `https` en `wss`.

## Desarrollo y compilación

```bash
bun install
bun run dev
```

Validaciones y build de producción:

```bash
bun run lint
bun run build
bun run preview
```

## Docker

```bash
docker-compose up --build
```

La imagen se construye en etapas: Bun genera los archivos estáticos y Nginx los sirve con fallback para SPA, compresión gzip y encabezados de seguridad. También se puede construir y ejecutar manualmente:

```bash
docker build -t react-graphql-admin .
docker run -p 3000:80 react-graphql-admin
```

## Organización del código

```text
src/
├── apollo/       # Cliente HTTP/WebSocket, autenticación y manejo de errores
├── components/   # Componentes compartidos, guards y banner de impersonación
├── graphql/      # Operaciones GraphQL por dominio
├── hooks/        # Acciones de autenticación y hooks compartidos
├── layouts/      # Layouts de autenticación y aplicación
├── pages/        # Páginas de administración y sus componentes/hooks locales
├── stores/       # Estado global persistido
├── types/        # Tipos compartidos
└── utils/        # Utilidades
```

Las operaciones GraphQL de autenticación viven en `src/graphql/auth/`. La acción del catálogo se encuentra en la página de usuarios y requiere el permiso `users.impersonate`; el layout principal muestra el banner mientras la sesión temporal está activa.

## Flujo de impersonación

1. Un usuario autorizado selecciona **Impersonar** en el catálogo de usuarios.
2. El frontend llama a `impersonateUser(userId)` y sustituye la sesión activa por la del usuario objetivo.
3. Las consultas y permisos se resuelven como el usuario objetivo; el cliente limpia la caché de Apollo al cambiar de identidad.
4. El banner superior permite ejecutar `stopImpersonation` y regresar a la sesión original.

Si expira la sesión temporal y no es posible renovarla, el frontend recupera la sesión original guardada. La autorización definitiva se valida en backend; ocultar o deshabilitar una acción en la interfaz no sustituye ese control.
