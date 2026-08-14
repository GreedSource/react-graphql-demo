# AGENTS.md — React GraphQL Demo

## Project Overview

This is a **React 19 + TypeScript + GraphQL** admin dashboard application built with Vite. It provides a full-featured RBAC (Role-Based Access Control) system with authentication, user/role/permission management, and real-time capabilities via GraphQL WebSocket subscriptions.

### Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19 with TypeScript |
| **Build Tool** | Vite 7 |
| **Package Manager** | Bun |
| **GraphQL Client** | Apollo Client 3 (HTTP + WebSocket subscriptions) |
| **UI Framework** | Material UI (MUI) 7 + Tailwind CSS 4 |
| **State Management** | Zustand 5 (persisted to IndexedDB with encryption) |
| **Routing** | React Router DOM 7 (lazy-loaded routes) |
| **Styling** | Tailwind CSS 4 (dark mode via CSS variables) |
| **Linting** | ESLint 9 with typescript-eslint |
| **Containerization** | Docker (multi-stage: Bun build → Nginx production) |
| **Notifications** | react-toastify |
| **Encryption** | crypto-js (for IndexedDB state persistence) |

### Architecture

```
src/
├── apollo/          # Apollo Client configuration (HTTP + WS links, auth refresh, error handling)
├── assets/          # Static assets
├── components/      # Reusable UI components (auth guards, Sidebar, Navbar, Footer, UI primitives)
├── config/          # Application configuration
├── constants/       # Constant values
├── graphql/         # GraphQL operations organized by domain (auth, user, role, module, action, permission)
├── hooks/           # Custom React hooks
├── interfaces/      # TypeScript interfaces
├── layouts/         # Page layouts (MainLayout, AuthLayout)
├── lib/             # Library/utility modules
├── pages/           # Route-level page components
├── stores/          # Zustand stores with IndexedDB persistence
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Key Features

- **Authentication Flow**: Login, Register, Password Recovery, Password Reset, Change Password
- **JWT Token Management**: Automatic access token refresh on 401 errors via Apollo error link
- **RBAC System**: Users, Roles, Modules, Actions, and Permissions management pages
- **Permission Guards**: Route-level protection via `PermissionRouteGuard` component
- **Guest/Protected Routes**: Separate route trees for authenticated and unauthenticated users
- **Real-time Support**: GraphQL WebSocket subscriptions via `graphql-ws`
- **Persistent State**: Zustand stores saved to IndexedDB with crypto-js encryption
- **Dark Mode**: CSS variable-based theming with class-based dark mode toggle
- **SPA Deployment**: Nginx-based production server with SPA fallback, gzip compression, and security headers

## Building and Running

### Prerequisites

- **Bun** (recommended) or npm/yarn/pnpm
- **Node.js** 18+ (if not using Bun)

### Development

```bash
# Install dependencies
bun install

# Start development server (with HMR)
bun run dev

# Lint code
bun run lint
```

### Production Build

```bash
# TypeScript check + Vite production build
bun run build

# Preview production build locally
bun run preview
```

### Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or build manually
docker build -t react-graphql-demo .
docker run -p 3000:80 react-graphql-demo
```

The Docker setup uses a **multi-stage build**: Bun for installing dependencies and building, then Nginx (stable-alpine) for serving the static assets.

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
VITE_APP_NAME=<app_display_name>
VITE_GRAPHQL_ENDPOINT=<graphql_api_url>
VITE_INDEXEDDB_DB_NAME=<indexeddb_database_name>
VITE_CRYPTO_SECRET=<encryption_secret_for_persistence>
```

These are also passed as build args in the Docker configuration.

## Development Conventions

### React Components and Interfaces

- Always implement React components as function components typed with `React.FC`.
- Define component props with a named TypeScript `interface`; do not use inline object types or `type` aliases for props.
- Use the `Props` suffix for props interfaces (for example, `UserCardProps`).
- Components without props must still use `React.FC`.

```tsx
interface UserCardProps {
  name: string;
  isActive?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ name, isActive = false }) => {
  return <div>{name}</div>;
};
```

### Path Aliases

The project uses `@/*` as a path alias for `src/*` (configured in `tsconfig.json` and resolved via `vite-tsconfig-paths`).

### Code Organization

- **GraphQL operations** are organized by domain under `src/graphql/<domain>/` with separate files for `queries.ts`, `mutations.ts`, and `subscriptions.ts`
- **Zustand stores** are in `src/stores/` with an `init.ts` bootstrap file that loads persisted state before app render
- **Auth guards** are in `src/components/auth/` (`GuestRoute`, `ProtectedRoute`, `PermissionRouteGuard`)
- **Pages** are lazy-loaded in `App.tsx` using `React.lazy` with a loading fallback
- Keep each page entry file focused on the route-level page component.
- Place components used by only one page in `src/pages/<page>/components/`.
- Place page-specific interfaces, props, and state contracts in `src/pages/<page>/types.ts`.
- Extract non-trivial page behavior into custom hooks under `src/pages/<page>/hooks/` (for example, `useTasksPage.ts`).
- Page components should focus on rendering: keep state orchestration, effects, derived data, GraphQL coordination, validation, and event handlers in the page hook.
- Do not create a custom hook for a purely presentational component that has no reusable or non-trivial behavior.
- Promote a component to `src/components/` only when it is shared or designed for reuse across multiple pages.

### State Management

- Zustand stores are persisted to **IndexedDB** with **crypto-js encryption**
- The `initializeStores()` function in `main.tsx` is `await`ed before rendering to ensure persisted state is loaded
- The `user` store manages `user`, `accessToken`, `refreshToken`, and `sessionChecked` state

### Apollo Client Configuration

- **HTTP Link**: Points to `VITE_GRAPHQL_ENDPOINT` with `credentials: 'include'`
- **WebSocket Link**: Auto-derived from HTTP endpoint (protocol swap: `http→ws`, `https→wss`)
- **Auth Link**: Injects `Authorization: Bearer <token>` header from Zustand store
- **Error Link**: Handles 401 errors by triggering token refresh flow; shows toast for non-UNAUTHORIZED GraphQL errors

### Styling

- **Tailwind CSS 4** with Vite plugin (`@tailwindcss/vite`)
- **Dark mode** via `class` strategy (CSS custom properties)
- **MUI components** used for complex UI primitives (CircularProgress, icons, etc.)
