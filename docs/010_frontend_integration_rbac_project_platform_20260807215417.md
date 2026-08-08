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
