# Frontend Integration - RBAC Project Platform

## Objetivo

Este documento describe el contrato que el frontend debe usar para integrarse con el backend GraphQL de autenticacion, RBAC, proyectos, tareas, membresias por proyecto, autorizacion contextual y auditoria.

## Contexto de la Aplicacion

La aplicacion debe evolucionar desde una interfaz administrativa de usuarios, roles y permisos hacia una plataforma de gestion de proyectos impulsada por un sistema de autorizacion propio.

El producto debe presentarse como:

```text
Una plataforma de gestion de proyectos con RBAC global, roles por proyecto, autorizacion por recurso y auditoria.
```

El diferenciador tecnico y funcional no es solamente crear proyectos o tareas, sino demostrar que cada accion visible y ejecutable depende de permisos concretos y del contexto del usuario dentro del proyecto.

El frontend debe permitir demostrar estos escenarios:

- Un administrador puede gestionar usuarios, roles, permisos, modulos, acciones, proyectos, tareas, miembros y auditoria.
- Un project manager puede administrar proyectos, tareas, asignaciones y miembros dentro de proyectos permitidos.
- Un developer puede ver proyectos y modificar tareas propias o autorizadas.
- Un client puede consultar proyectos, tareas y reportes sin modificar datos.
- Un viewer puede navegar informacion de solo lectura.
- El mismo usuario puede tener capacidades diferentes segun el proyecto actual.

Ejemplo principal de contexto:

```text
Joel
├── Project A -> project_manager
├── Project B -> developer
└── Project C -> viewer
```

La UI debe hacer evidente este cambio de contexto. El usuario no cambia de cuenta; cambian sus capacidades segun el proyecto seleccionado.

## Solicitud de Rediseno Frontend

Se solicita redisenar la aplicacion frontend para alinearse con esta nueva direccion de producto.

El frontend ya no debe tratar el sistema como un CRUD administrativo aislado. Debe reorganizarse alrededor de una experiencia de gestion de proyectos con autorizacion visible y contextual.

### Objetivo del Rediseno

Construir una interfaz donde la primera experiencia del usuario sea operar proyectos, tareas y miembros, mientras la administracion RBAC queda como una seccion administrativa para usuarios con permisos suficientes.

### Navegacion Esperada

La navegacion principal sugerida:

```text
Dashboard
Projects
Tasks
Teams / Members
Reports
Activity / Audit Logs
Administration
```

La seccion `Administration` debe agrupar:

```text
Users
Roles
Permissions
Modules
Actions
```

Estas rutas deben mostrarse u ocultarse con permisos, no con roles hardcodeados.

### Pantallas Prioritarias

Dashboard:

- resumen de proyectos activos
- tareas asignadas al usuario
- tareas atrasadas o bloqueadas
- actividad reciente
- accesos rapidos condicionados por permisos

Projects:

- lista de proyectos
- estado del proyecto
- accion para crear proyecto solo con `projects.create`
- acciones de editar, archivar o eliminar solo si existen permisos correspondientes
- entrada clara al contexto del proyecto

Project Detail:

- informacion del proyecto
- tabs o secciones de tareas, miembros, actividad y reportes
- indicador visible del rol contextual del usuario en ese proyecto
- acciones disponibles derivadas de permisos globales y contexto

Tasks:

- lista filtrable por proyecto, estado, prioridad y asignado
- crear tarea con `tasks.create`
- asignar con `tasks.assign`
- completar con `tasks.complete`
- editar con `tasks.update`, considerando que backend puede denegar por ownership/contexto

Members:

- listar miembros del proyecto
- agregar miembro con `members.manage`
- cambiar rol contextual con `members.manage`
- mostrar rol de proyecto: `project_manager`, `developer`, `client`, `viewer`

Activity / Audit Logs:

- disponible solo con `activity.read`
- mostrar acciones `success` y `denied`
- mostrar `metadata.reason` para explicar decisiones de autorizacion

Administration:

- mantener gestion RBAC existente
- hacerla secundaria frente a la experiencia de proyectos
- proteger cada subseccion por permisos `users.read`, `roles.read`, `permissions.read`, `modules.read`, `actions.read`

### Reglas de UX para Autorizacion

- No hardcodear permisos por nombre de rol.
- Usar siempre `can("module.action")` para rutas, botones, menus y acciones.
- Mostrar estados deshabilitados o esconder acciones segun el permiso disponible.
- Aunque una accion se muestre, manejar `FORBIDDEN` porque backend aplica autorizacion contextual por recurso.
- En detalle de proyecto, mostrar el rol contextual del usuario si esta disponible.
- En acciones denegadas, mostrar mensajes claros como `No tienes permiso para realizar esta accion en este proyecto`.
- En `UNAUTHORIZED`, redirigir a login o renovar token.
- En `NOT_FOUND`, mostrar pantalla de recurso no encontrado.

### Resultado Esperado del Rediseno

La aplicacion debe sentirse como una herramienta operativa de gestion de proyectos, no como una pantalla tecnica de administracion RBAC.

El RBAC debe estar presente en la experiencia mediante:

- navegacion dinamica
- botones condicionados
- acciones contextuales
- pantallas administrativas protegidas
- auditoria visible
- diferencias claras entre permisos globales y permisos por proyecto

## Base URL

Desarrollo local recomendado:

```text
http://localhost:5000/graphql
```

Docker/API default:

```text
http://localhost:8000/graphql
```

Endpoints utiles:

```text
GET  /ping
GET  /graphql
POST /graphql
WS   /graphql
```

## Autenticacion

El backend acepta token JWT por header:

```http
Authorization: Bearer <accessToken>
```

Tambien existe fallback por cookies configuradas en backend:

```text
access_token
refresh_token
```

Para frontend, la integracion mas simple es guardar `accessToken` y enviarlo en cada request GraphQL.

## Shape de respuestas

La mayoria de operaciones devuelven:

```graphql
{
  status
  message
  data
}
```

Ejemplo:

```json
{
  "status": 200,
  "message": "Projects fetched",
  "data": []
}
```

## Errores

Los errores GraphQL usan `extensions.code`.

Casos esperados:

```text
UNAUTHORIZED -> 401, usuario no autenticado o token invalido
FORBIDDEN    -> 403, usuario autenticado sin permiso suficiente
NOT_FOUND    -> 404, recurso inexistente en operaciones que requieren recurso
BAD_REQUEST  -> 400, validacion o error de negocio
```

Ejemplo:

```json
{
  "errors": [
    {
      "message": "Permiso denegado",
      "extensions": {
        "code": "FORBIDDEN",
        "details": {}
      }
    }
  ]
}
```

## Login

Mutation:

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    status
    message
    data {
      accessToken
      refreshToken
      user {
        id
        name
        lastname
        email
        role {
          id
          name
          permissions {
            type
            action
          }
        }
      }
    }
  }
}
```

Variables:

```json
{
  "input": {
    "email": "admin@example.com",
    "password": "Admin1234!"
  }
}
```

## Permisos en Frontend

El backend expone permisos como:

```json
{
  "type": "projects",
  "action": "create"
}
```

El frontend puede convertirlos a keys:

```ts
type Permission = { type: string; action: string };

export function toPermissionKey(permission: Permission) {
  return `${permission.type}.${permission.action}`;
}

export function createCan(permissions: Permission[]) {
  const keys = new Set(permissions.map(toPermissionKey));
  return (permission: string) => keys.has(permission);
}
```

Uso:

```tsx
const can = createCan(user.role.permissions);

if (can("projects.create")) {
  // render Create Project button
}
```

Importante:

```text
Frontend = UX / visibilidad
Backend  = seguridad real
```

Ocultar botones no reemplaza la autorizacion del backend.

## Permisos Relevantes

Administracion RBAC:

```text
users.create
users.read
users.update
users.delete
roles.create
roles.read
roles.update
roles.delete
permissions.create
permissions.read
permissions.delete
modules.create
modules.read
modules.update
actions.create
actions.read
```

Project platform:

```text
dashboard.read
projects.create
projects.read
projects.update
projects.delete
projects.archive
tasks.create
tasks.read
tasks.update
tasks.delete
tasks.assign
tasks.complete
teams.read
teams.update
teams.manage
members.read
members.manage
reports.read
reports.export
activity.read
```

## Roles Semilla

Roles globales:

```text
admin
user
super_admin
project_manager
developer
client
viewer
```

Roles contextuales por proyecto:

```text
project_manager
developer
client
viewer
```

Un mismo usuario puede tener diferentes roles segun el proyecto mediante `ProjectMember`.

## Projects

Query list:

```graphql
query Projects($includeArchived: Boolean) {
  projects(includeArchived: $includeArchived) {
    status
    message
    data {
      id
      name
      description
      status
      ownerId
      archivedAt
      createdAt
      updatedAt
    }
  }
}
```

Create:

```graphql
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    status
    message
    data {
      id
      name
      status
    }
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Project A",
    "description": "Demo project",
    "ownerId": "uuid-user-id"
  }
}
```

Other operations:

```graphql
query Project($id: ID!) { project(id: $id) { status message data { id name status } } }
mutation UpdateProject($input: UpdateProjectInput!) { updateProject(input: $input) { status message data { id name status } } }
mutation ArchiveProject($id: ID!) { archiveProject(id: $id) { status message data { id status archivedAt } } }
mutation DeleteProject($id: ID!) { deleteProject(id: $id) { status message data } }
```

Required permissions:

```text
projects.read
projects.create
projects.update
projects.archive
projects.delete
```

## Tasks

Query list:

```graphql
query Tasks($projectId: ID) {
  tasks(projectId: $projectId) {
    status
    message
    data {
      id
      projectId
      title
      description
      status
      priority
      assigneeId
      createdById
      dueDate
      completedAt
      createdAt
      updatedAt
    }
  }
}
```

Create:

```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    status
    message
    data {
      id
      title
      status
      priority
      assigneeId
    }
  }
}
```

Variables:

```json
{
  "input": {
    "projectId": "uuid-project-id",
    "title": "Build authorization UI",
    "description": "Render buttons using permission keys",
    "priority": "high",
    "assigneeId": "uuid-user-id"
  }
}
```

Other operations:

```graphql
query Task($id: ID!) { task(id: $id) { status message data { id title status priority } } }
mutation UpdateTask($input: UpdateTaskInput!) { updateTask(input: $input) { status message data { id title status priority } } }
mutation AssignTask($id: ID!, $assigneeId: ID!) { assignTask(id: $id, assigneeId: $assigneeId) { status message data { id assigneeId } } }
mutation CompleteTask($id: ID!) { completeTask(id: $id) { status message data { id status completedAt } } }
mutation DeleteTask($id: ID!) { deleteTask(id: $id) { status message data } }
```

Required permissions:

```text
tasks.read
tasks.create
tasks.update
tasks.assign
tasks.complete
tasks.delete
```

Contextual authorization:

```text
tasks.update / tasks.complete
```

requiere permiso global y ademas:

```text
membership en el proyecto
AND project role con permiso contextual
AND (usuario asignado a la tarea OR project role con tasks.assign)
```

## Project Members

List members:

```graphql
query ProjectMembers($projectId: ID!) {
  projectMembers(projectId: $projectId) {
    status
    message
    data {
      id
      projectId
      userId
      projectRoleId
      projectRole {
        id
        name
        description
        active
      }
      createdAt
      updatedAt
    }
  }
}
```

Add member:

```graphql
mutation AddProjectMember($input: AddProjectMemberInput!) {
  addProjectMember(input: $input) {
    status
    message
    data {
      id
      projectId
      userId
      projectRole {
        name
      }
    }
  }
}
```

Variables:

```json
{
  "input": {
    "projectId": "uuid-project-id",
    "userId": "uuid-user-id",
    "projectRoleId": "uuid-project-role-id"
  }
}
```

Other operations:

```graphql
mutation UpdateProjectMemberRole($input: UpdateProjectMemberRoleInput!) { updateProjectMemberRole(input: $input) { status message data { id projectRole { name } } } }
mutation RemoveProjectMember($id: ID!) { removeProjectMember(id: $id) { status message data } }
```

Required permissions:

```text
members.read
members.manage
```

## Audit Logs

Query:

```graphql
query AuditLogs($limit: Int) {
  auditLogs(limit: $limit) {
    status
    message
    data {
      id
      userId
      module
      action
      resourceType
      resourceId
      status
      metadata
      createdAt
    }
  }
}
```

Required permission:

```text
activity.read
```

Status values:

```text
success
denied
```

`metadata.reason` puede incluir valores como:

```text
allowed_by_global_permission
allowed_by_admin_scope
allowed_by_project_role
allowed_by_task_policy
missing_global_permission
missing_project_membership
missing_project_role_permission
task_ownership_required
unauthenticated
```

## Admin RBAC Screens

Queries:

```graphql
query Users { users { status message data { id name lastname email role { id name permissions { type action } } } } }
query Roles { roles { status message data { id name description active permissions { type action } } } }
query Modules { modules { status message data { id name key description active } } }
query Actions { actions { status message data { id name key description active } } }
query Permissions { permissions { status message data { id moduleKey actionKey description } } }
```

Common required permissions:

```text
users.read
roles.read
modules.read
actions.read
permissions.read
```

## Frontend Integration Reference

Esta seccion consolida los contratos que el frontend debe conocer para integrar todos los flujos funcionales del backend.
La API es schema-first con Ariadne, por lo que los nombres de operaciones, inputs y campos deben respetarse exactamente como estan definidos aqui.

### Reglas Generales de Cliente

- Todas las operaciones GraphQL usan `POST /graphql`, excepto suscripciones que usan `WS /graphql`.
- Enviar `Authorization: Bearer <accessToken>` en queries y mutations protegidas.
- Guardar `accessToken`, `refreshToken` y `user` despues de `login`, `register` o `refreshToken`.
- Los `ID` GraphQL deben tratarse como `string` en frontend.
- Los campos `DateTime` deben enviarse y mostrarse como ISO 8601.
- Los campos opcionales que no cambian en updates deben omitirse; no enviar `null` salvo que el flujo quiera limpiar el dato y backend lo soporte.
- Los permisos visibles en UI salen de `user.role.permissions` como pares `{ type, action }`.
- La UI puede ocultar acciones por permisos, pero el backend sigue siendo la fuente de autorizacion.

Ejemplo de normalizacion de permisos:

```ts
type BackendPermission = { type: string; action: string };

export function toPermissionKeys(permissions: BackendPermission[] = []) {
  return new Set(permissions.map((permission) => `${permission.type}.${permission.action}`));
}

export function can(permissionKeys: Set<string>, permission: string) {
  return permissionKeys.has(permission);
}
```

### Operaciones Publicas

Estas operaciones no requieren permiso RBAC.

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    status
    message
    data {
      accessToken
      refreshToken
      user {
        id
        name
        lastname
        email
        role { id name permissions { type action } }
      }
    }
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Ana",
    "lastname": "Lopez",
    "email": "ana@example.com",
    "password": "secret123",
    "confirmPassword": "secret123"
  }
}
```

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    status
    message
    data {
      accessToken
      refreshToken
      user {
        id
        name
        lastname
        email
        role { id name permissions { type action } }
      }
    }
  }
}
```

```graphql
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    status
    message
    data {
      accessToken
      refreshToken
      user {
        id
        name
        lastname
        email
        role { id name permissions { type action } }
      }
    }
  }
}
```

```graphql
mutation RecoverPassword($email: String!) {
  recoverPassword(email: $email) { status message data }
}
```

```graphql
mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) { status message data }
}
```

```graphql
mutation Logout {
  logout { status message data }
}
```

Flujo frontend esperado:

- `login/register`: persistir tokens y usuario, precargar permisos, redirigir a dashboard.
- `refreshToken`: ejecutar cuando una operacion responde `UNAUTHORIZED`; si falla, limpiar sesion y redirigir a login.
- `recoverPassword`: mostrar estado neutral aunque el email no exista, para evitar enumeracion.
- `resetPassword`: tomar `token` desde la URL enviada por correo y solicitar `password` + `confirmPassword`.
- `logout`: llamar mutation si hay sesion, limpiar almacenamiento local y cerrar conexiones WebSocket.

### Operaciones Protegidas

```graphql
query Profile {
  profile {
    status
    message
    data {
      id
      name
      lastname
      email
      role { id name permissions { type action } }
    }
  }
}
```

`profile` requiere usuario autenticado. Debe usarse al restaurar sesion o al abrir la aplicacion si hay token persistido.

## GraphQL Operation Matrix

Esta matriz debe usarse para guards de rutas, visibilidad de botones, estados disabled y mensajes de acceso denegado.

| Dominio | Operacion | Tipo | Permiso |
|---------|-----------|------|---------|
| Auth | `register` | Mutation | Publica |
| Auth | `login` | Mutation | Publica |
| Auth | `refreshToken` | Mutation | Publica |
| Auth | `recoverPassword` | Mutation | Publica |
| Auth | `resetPassword` | Mutation | Publica |
| Auth | `logout` | Mutation | Publica |
| Auth | `profile` | Query | Autenticado |
| Users | `users` | Query | `users.read` |
| Users | `user` | Query | `users.read` |
| Users | `updateUser` | Mutation | `users.update` |
| Users | `deleteUser` | Mutation | `users.delete` |
| Users | `userUpdated` | Subscription | Autenticado por contexto WS |
| Roles | `roles` | Query | `roles.read` |
| Roles | `role` | Query | `roles.read` |
| Roles | `createRole` | Mutation | `roles.create` |
| Roles | `updateRole` | Mutation | `roles.update` |
| Roles | `deleteRole` | Mutation | `roles.delete` |
| Roles | `addPermissionsToRole` | Mutation | `roles.update` |
| Roles | `removePermissionsFromRole` | Mutation | `roles.update` |
| Modules | `modules` | Query | `modules.read` |
| Modules | `module` | Query | `modules.read` |
| Modules | `createModule` | Mutation | `modules.create` |
| Modules | `updateModule` | Mutation | `modules.update` |
| Actions | `actions` | Query | `actions.read` |
| Actions | `createAction` | Mutation | `actions.create` |
| Permissions | `permissions` | Query | `permissions.read` |
| Permissions | `createPermission` | Mutation | `permissions.create` |
| Permissions | `deletePermission` | Mutation | `permissions.delete` |
| Projects | `projects` | Query | `projects.read` |
| Projects | `project` | Query | `projects.read` + autorizacion por recurso |
| Projects | `createProject` | Mutation | `projects.create` |
| Projects | `updateProject` | Mutation | `projects.update` + autorizacion por recurso |
| Projects | `archiveProject` | Mutation | `projects.archive` + autorizacion por recurso |
| Projects | `deleteProject` | Mutation | `projects.delete` + autorizacion por recurso |
| Tasks | `tasks` | Query | `tasks.read` + autorizacion por proyecto cuando aplica |
| Tasks | `task` | Query | `tasks.read` + autorizacion por recurso |
| Tasks | `createTask` | Mutation | `tasks.create` |
| Tasks | `updateTask` | Mutation | `tasks.update` + autorizacion por recurso |
| Tasks | `assignTask` | Mutation | `tasks.assign` + autorizacion por recurso |
| Tasks | `completeTask` | Mutation | `tasks.complete` + autorizacion por recurso |
| Tasks | `deleteTask` | Mutation | `tasks.delete` + autorizacion por recurso |
| Members | `projectMembers` | Query | `members.read` |
| Members | `addProjectMember` | Mutation | `members.manage` |
| Members | `updateProjectMemberRole` | Mutation | `members.manage` |
| Members | `removeProjectMember` | Mutation | `members.manage` |
| Audit | `auditLogs` | Query | `activity.read` |

## Auth And Session Flow

Pantallas requeridas:

- Login
- Registro
- Recuperar password
- Resetear password
- Perfil/sesion
- Logout

Estados que debe manejar la UI:

- `loading`: envio de formulario o restauracion de sesion.
- `authenticated`: hay `accessToken` valido y `profile` responde correctamente.
- `refreshing`: se esta renovando el token.
- `anonymous`: no hay sesion o refresh fallo.
- `forbidden`: sesion valida sin permiso para una ruta.

Estrategia recomendada:

```ts
async function executeWithRefresh(operation: () => Promise<unknown>) {
  try {
    return await operation();
  } catch (error) {
    if (!isUnauthorized(error)) throw error;
    await refreshAccessToken();
    return operation();
  }
}
```

Reglas:

- Nunca usar `refreshToken` como bearer token.
- Si `refreshToken` falla, limpiar almacenamiento y cerrar WebSocket.
- Rehidratar usuario con `profile` al cargar la app, porque el rol o permisos pueden haber cambiado.
- Si `profile` devuelve `FORBIDDEN` o `UNAUTHORIZED`, tratarlo como sesion invalida.

## Users Flow

Pantallas esperadas:

- Lista de usuarios.
- Detalle de usuario.
- Edicion basica de usuario.
- Asignacion de rol.
- Eliminacion/desactivacion segun comportamiento backend.

Queries y mutations:

```graphql
query Users {
  users {
    status
    message
    data {
      id
      name
      lastname
      email
      role { id name description active permissions { type action } }
    }
  }
}
```

```graphql
query User($id: ID!) {
  user(id: $id) {
    status
    message
    data {
      id
      name
      lastname
      email
      role { id name permissions { type action } }
    }
  }
}
```

```graphql
mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    status
    message
    data { id name lastname email role { id name } }
  }
}
```

Variables:

```json
{
  "input": {
    "id": "user-id",
    "name": "Ana",
    "lastname": "Lopez",
    "roleId": "role-id"
  }
}
```

```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id) { status message data }
}
```

UX:

- Mostrar asignacion de rol solo con `users.update` y `roles.read`.
- Deshabilitar eliminar el propio usuario activo en UI aunque backend sea la autoridad final.
- Refrescar `profile` si el usuario actual cambia su propio rol o datos.

## Roles And Permissions Flow

Pantallas esperadas:

- Lista de roles.
- Crear rol.
- Editar rol.
- Matriz de permisos por modulo y accion.
- Agregar/quitar permisos de un rol.
- Eliminar rol.

Queries y mutations:

```graphql
query Roles {
  roles {
    status
    message
    data {
      id
      name
      description
      active
      permissions { type action }
    }
  }
}
```

```graphql
query Role($id: ID!) {
  role(id: $id) {
    status
    message
    data {
      id
      name
      description
      active
      permissions { type action }
    }
  }
}
```

```graphql
mutation CreateRole($input: CreateRoleInput!) {
  createRole(input: $input) {
    status
    message
    data { id name description active permissions { type action } }
  }
}
```

```graphql
mutation UpdateRole($input: UpdateRoleInput!) {
  updateRole(input: $input) {
    status
    message
    data { id name description active permissions { type action } }
  }
}
```

```graphql
mutation DeleteRole($id: ID!) {
  deleteRole(id: $id) { status message data }
}
```

```graphql
mutation AddPermissionsToRole($roleId: ID!, $permissionIds: [ID!]!) {
  addPermissionsToRole(roleId: $roleId, permissionIds: $permissionIds) {
    status
    message
    data
  }
}
```

```graphql
mutation RemovePermissionsFromRole($roleId: ID!, $permissionIds: [ID!]!) {
  removePermissionsFromRole(roleId: $roleId, permissionIds: $permissionIds) {
    status
    message
    data
  }
}
```

Variables para matriz:

```json
{
  "roleId": "role-id",
  "permissionIds": ["permission-id-1", "permission-id-2"]
}
```

UX:

- Construir la matriz usando `modules`, `actions` y `permissions`.
- Usar `Permission.id` para asignar/quitar permisos, no `moduleKey.actionKey`.
- Mostrar `moduleKey.actionKey` como etiqueta legible para frontend.
- Despues de cambiar permisos de un rol, refrescar `roles` y `profile` si el rol afectado es el del usuario actual.

## Modules, Actions And Permission Catalog Flow

Estas pantallas son de administracion avanzada. Deben protegerse con permisos especificos porque modifican el catalogo base de RBAC.

```graphql
query Modules {
  modules {
    status
    message
    data { id name key description active }
  }
}
```

```graphql
query Module($id: ID!) {
  module(id: $id) {
    status
    message
    data { id name key description active }
  }
}
```

```graphql
mutation CreateModule($input: CreateModuleInput!) {
  createModule(input: $input) {
    status
    message
    data { id name key description active }
  }
}
```

```graphql
mutation UpdateModule($input: UpdateModuleInput!) {
  updateModule(input: $input) {
    status
    message
    data { id name key description active }
  }
}
```

```graphql
query Actions {
  actions {
    status
    message
    data { id name key description active }
  }
}
```

```graphql
mutation CreateAction($input: CreateActionInput!) {
  createAction(input: $input) {
    status
    message
    data { id name key description active }
  }
}
```

```graphql
query Permissions {
  permissions {
    status
    message
    data {
      id
      description
      moduleId
      actionId
      moduleKey
      actionKey
    }
  }
}
```

```graphql
mutation CreatePermission($input: CreatePermissionInput!) {
  createPermission(input: $input) {
    status
    message
    data { id description moduleId actionId moduleKey actionKey }
  }
}
```

```graphql
mutation DeletePermission($id: ID!) {
  deletePermission(id: $id)
}
```

UX:

- `module.key` y `action.key` deben tratarse como claves tecnicas estables.
- Antes de borrar permisos, mostrar confirmacion porque puede afectar roles existentes.
- No existe mutation `updateAction` en el contrato actual aunque existe `UpdateActionInput`; frontend no debe implementarla hasta que backend la exponga.

## Project Workspace Flow

Pantallas esperadas:

- Lista de proyectos.
- Detalle de proyecto.
- Crear proyecto.
- Editar proyecto.
- Archivar proyecto.
- Eliminar proyecto.
- Tabs internos: tareas, miembros, actividad contextual si se agrega filtrado futuro.

Queries y mutations:

```graphql
query Projects($includeArchived: Boolean) {
  projects(includeArchived: $includeArchived) {
    status
    message
    data {
      id
      name
      description
      status
      ownerId
      archivedAt
      createdAt
      updatedAt
    }
  }
}
```

```graphql
query Project($id: ID!) {
  project(id: $id) {
    status
    message
    data {
      id
      name
      description
      status
      ownerId
      archivedAt
      createdAt
      updatedAt
    }
  }
}
```

```graphql
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    status
    message
    data { id name description status ownerId archivedAt createdAt updatedAt }
  }
}
```

```graphql
mutation UpdateProject($input: UpdateProjectInput!) {
  updateProject(input: $input) {
    status
    message
    data { id name description status ownerId archivedAt createdAt updatedAt }
  }
}
```

```graphql
mutation ArchiveProject($id: ID!) {
  archiveProject(id: $id) {
    status
    message
    data { id name status archivedAt updatedAt }
  }
}
```

```graphql
mutation DeleteProject($id: ID!) {
  deleteProject(id: $id) { status message data }
}
```

Variables:

```json
{
  "input": {
    "name": "Project A",
    "description": "Internal delivery workspace",
    "ownerId": "user-id"
  }
}
```

UX:

- `includeArchived: false` debe ser el default visual.
- Mostrar proyectos archivados en filtro separado.
- Bloquear edicion de proyectos archivados salvo acciones de administracion que el backend permita.
- Mostrar estados de recurso denegado como `FORBIDDEN`, no como proyecto inexistente.
- La autorizacion por recurso puede negar acciones aunque el usuario tenga permiso global.

## Task Management Flow

Pantallas esperadas:

- Lista de tareas global o por proyecto.
- Kanban/lista por `status`.
- Crear tarea.
- Editar tarea.
- Asignar responsable.
- Completar tarea.
- Eliminar tarea.

Queries y mutations:

```graphql
query Tasks($projectId: ID) {
  tasks(projectId: $projectId) {
    status
    message
    data {
      id
      projectId
      title
      description
      status
      priority
      assigneeId
      createdById
      dueDate
      completedAt
      createdAt
      updatedAt
    }
  }
}
```

```graphql
query Task($id: ID!) {
  task(id: $id) {
    status
    message
    data {
      id
      projectId
      title
      description
      status
      priority
      assigneeId
      createdById
      dueDate
      completedAt
      createdAt
      updatedAt
    }
  }
}
```

```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    status
    message
    data {
      id
      projectId
      title
      description
      status
      priority
      assigneeId
      createdById
      dueDate
      completedAt
      createdAt
      updatedAt
    }
  }
}
```

```graphql
mutation UpdateTask($input: UpdateTaskInput!) {
  updateTask(input: $input) {
    status
    message
    data { id title description status priority assigneeId dueDate completedAt updatedAt }
  }
}
```

```graphql
mutation AssignTask($id: ID!, $assigneeId: ID!) {
  assignTask(id: $id, assigneeId: $assigneeId) {
    status
    message
    data { id assigneeId updatedAt }
  }
}
```

```graphql
mutation CompleteTask($id: ID!) {
  completeTask(id: $id) {
    status
    message
    data { id status completedAt updatedAt }
  }
}
```

```graphql
mutation DeleteTask($id: ID!) {
  deleteTask(id: $id) { status message data }
}
```

UX:

- Usar `tasks(projectId)` dentro del detalle de proyecto.
- Usar `tasks` sin `projectId` solo en vistas globales.
- Filtrar o agrupar por `status`: `todo`, `in_progress`, `blocked`, `done`.
- Mostrar prioridad con orden visual: `urgent`, `high`, `medium`, `low`.
- La asignacion debe cargar candidatos desde `users` y, para contexto de proyecto, desde `projectMembers`.
- `completeTask` debe ser una accion rapida visible solo con `tasks.complete`.
- Si una tarea requiere ownership o membresia, backend puede responder `FORBIDDEN` aunque el permiso global exista.

## Project Members Flow

Pantallas esperadas:

- Lista de miembros por proyecto.
- Agregar miembro.
- Cambiar rol de miembro.
- Remover miembro.

Queries y mutations:

```graphql
query ProjectMembers($projectId: ID!) {
  projectMembers(projectId: $projectId) {
    status
    message
    data {
      id
      projectId
      userId
      projectRoleId
      projectRole { id name description active }
      createdAt
      updatedAt
    }
  }
}
```

```graphql
mutation AddProjectMember($input: AddProjectMemberInput!) {
  addProjectMember(input: $input) {
    status
    message
    data {
      id
      projectId
      userId
      projectRoleId
      projectRole { id name }
      createdAt
      updatedAt
    }
  }
}
```

```graphql
mutation UpdateProjectMemberRole($input: UpdateProjectMemberRoleInput!) {
  updateProjectMemberRole(input: $input) {
    status
    message
    data {
      id
      projectId
      userId
      projectRoleId
      projectRole { id name }
      updatedAt
    }
  }
}
```

```graphql
mutation RemoveProjectMember($id: ID!) {
  removeProjectMember(id: $id) { status message data }
}
```

Variables:

```json
{
  "input": {
    "projectId": "project-id",
    "userId": "user-id",
    "projectRoleId": "project-role-id"
  }
}
```

UX:

- Cargar `users` para seleccionar usuario.
- Usar `projectMembers(projectId)` para evitar agregar duplicados.
- Mostrar `projectRole.name` como rol contextual del proyecto.
- Los roles de proyecto son distintos de `User.role`; `User.role` es RBAC global, `ProjectMember.projectRole` es autorizacion contextual.

## Audit Flow

Pantalla esperada:

- Registro de actividad administrativo.

```graphql
query AuditLogs($limit: Int) {
  auditLogs(limit: $limit) {
    status
    message
    data {
      id
      userId
      module
      action
      resourceType
      resourceId
      status
      metadata
      createdAt
    }
  }
}
```

UX:

- Default recomendado: `limit: 100`.
- Renderizar `metadata` como JSON expandible o tabla key-value.
- Permitir filtros client-side por `module`, `action`, `status`, `resourceType` y `userId`.
- No mostrar esta pantalla sin `activity.read`.

## WebSocket And Subscriptions

Endpoint:

```text
ws://<host>/graphql
wss://<host>/graphql
```

Subscription disponible para usuario:

```graphql
subscription UserUpdated($userId: ID!) {
  userUpdated(userId: $userId) {
    id
    name
    lastname
    email
    role { id name permissions { type action } }
  }
}
```

Uso recomendado:

- Abrir la suscripcion solo cuando haya sesion autenticada.
- Pasar el token en el mecanismo de connection params del cliente GraphQL usado por frontend.
- Suscribirse al `userId` del usuario actual para detectar cambios de perfil o permisos.
- Al recibir evento, reemplazar el usuario local y recalcular `permissionKeys`.
- Cerrar la conexion en logout o cuando falle refresh token.

Nota:

- `hello` y su subscription asociada son diagnosticas/desarrollo; no son parte de los flujos de producto.

## Error Handling For All Flows

Mapeo recomendado:

| Codigo | UI esperada |
|--------|-------------|
| `UNAUTHORIZED` | Intentar refresh; si falla, redirect a login |
| `FORBIDDEN` | Mostrar pantalla 403 o toast de accion no permitida |
| `NOT_FOUND` | Mostrar empty state de recurso inexistente |
| `BAD_REQUEST` | Mostrar errores de validacion del formulario |
| `CONFLICT` | Mostrar conflicto de dato duplicado o estado invalido |
| `INTERNAL_SERVER_ERROR` | Mostrar mensaje generico y registrar detalle tecnico |

Reglas:

- No depender solamente de `status`; revisar `errors[].extensions.code` cuando GraphQL devuelva errores.
- Una respuesta con `data: null` en un campo nullable puede significar recurso inexistente o error controlado; revisar `message`.
- En mutations exitosas, usar `data` de la respuesta para actualizar cache local.

## Recommended Integration Order

1. Cliente GraphQL HTTP con bearer token.
2. Login, refresh token, logout y restauracion con `profile`.
3. Normalizador de permisos y guards de rutas.
4. Pantallas base de usuarios y roles.
5. Catalogos RBAC: modules, actions, permissions.
6. Matriz de permisos por rol.
7. Projects list/detail/create/update/archive/delete.
8. Project members.
9. Tasks por proyecto y vista global.
10. Audit logs.
11. WebSocket `userUpdated` para cambios de usuario/permisos en vivo.

## Suggested Frontend Route Guards

Map pages to permissions:

```ts
export const routePermissions = {
  dashboard: "dashboard.read",
  projects: "projects.read",
  tasks: "tasks.read",
  teams: "teams.read",
  reports: "reports.read",
  activity: "activity.read",
  users: "users.read",
  roles: "roles.read",
  permissions: "permissions.read",
};
```

Example:

```tsx
if (!can(routePermissions.projects)) {
  return <ForbiddenPage />;
}
```

## Suggested UI Capability Map

```ts
export const capabilities = {
  canCreateProject: "projects.create",
  canUpdateProject: "projects.update",
  canArchiveProject: "projects.archive",
  canDeleteProject: "projects.delete",
  canCreateTask: "tasks.create",
  canUpdateTask: "tasks.update",
  canAssignTask: "tasks.assign",
  canCompleteTask: "tasks.complete",
  canDeleteTask: "tasks.delete",
  canManageMembers: "members.manage",
  canViewAuditLogs: "activity.read",
};
```

## Demo Data

El backend incluye un seeder de demo:

```bash
python manage.py seed-demo
```

Tambien corre dentro de:

```bash
python manage.py seed-all
```

Usuarios demo esperados:

```text
joel.manager@example.com
maria.developer@example.com
carlos.client@example.com
valeria.viewer@example.com
```

Escenario clave:

```text
Joel
├── Project A -> project_manager
├── Project B -> developer
└── Project C -> viewer
```

Este escenario permite validar que el mismo usuario tenga capacidades distintas segun el proyecto.

## Estados y Validaciones

Project status:

```text
active
archived
```

Task status:

```text
todo
in_progress
blocked
done
```

Task priority:

```text
low
medium
high
urgent
```

## Checklist de Integracion Frontend

- Implementar cliente GraphQL con `Authorization: Bearer <accessToken>`.
- Guardar `accessToken`, `refreshToken` y `user`.
- Convertir `user.role.permissions` a keys `module.action`.
- Usar `can("module.action")` para rutas, botones y estados visuales.
- Manejar `UNAUTHORIZED` redirigiendo a login.
- Manejar `FORBIDDEN` mostrando pantalla o toast de acceso denegado.
- Manejar `NOT_FOUND` como recurso inexistente.
- No asumir que UI oculta equivale a seguridad.
- Usar `projectMembers` para construir contexto de rol por proyecto.
- Usar `auditLogs` solo en pantallas administrativas con `activity.read`.
