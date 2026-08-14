import type {
  AuditEvent,
  Project,
  ProjectRole,
  ProjectTask,
  TaskPriority,
  TaskStatus,
} from '@/types/project-platform';

export const projects: Project[] = [
  {
    id: 'project-a',
    name: 'Atlas Client Portal',
    client: 'Atlas Group',
    status: 'active',
    progress: 72,
    dueDate: '2026-08-29',
    contextualRole: 'project_manager',
    summary:
      'Portal operativo para clientes con tableros, reportes y aprobaciones.',
    members: [
      {
        id: 'm-1',
        name: 'Joel Alvarez',
        email: 'joel@example.com',
        projectRole: 'project_manager',
      },
      {
        id: 'm-2',
        name: 'Ana Torres',
        email: 'ana@example.com',
        projectRole: 'developer',
      },
      {
        id: 'm-3',
        name: 'Mia Chen',
        email: 'mia@example.com',
        projectRole: 'client',
      },
    ],
  },
  {
    id: 'project-b',
    name: 'Nova RBAC Engine',
    client: 'Internal Platform',
    status: 'at_risk',
    progress: 48,
    dueDate: '2026-08-18',
    contextualRole: 'developer',
    summary:
      'Autorizacion por recurso para proyectos, tareas y acciones auditables.',
    members: [
      {
        id: 'm-4',
        name: 'Joel Alvarez',
        email: 'joel@example.com',
        projectRole: 'developer',
      },
      {
        id: 'm-5',
        name: 'Lucia Gomez',
        email: 'lucia@example.com',
        projectRole: 'project_manager',
      },
    ],
  },
  {
    id: 'project-c',
    name: 'Cobalt Reporting',
    client: 'Cobalt Health',
    status: 'active',
    progress: 91,
    dueDate: '2026-09-12',
    contextualRole: 'viewer',
    summary:
      'Reportes ejecutivos de avance, entregables, riesgos y actividad reciente.',
    members: [
      {
        id: 'm-6',
        name: 'Joel Alvarez',
        email: 'joel@example.com',
        projectRole: 'viewer',
      },
      {
        id: 'm-7',
        name: 'Nora Patel',
        email: 'nora@example.com',
        projectRole: 'client',
      },
    ],
  },
];

export const tasks: ProjectTask[] = [
  {
    id: 'task-1',
    title: 'Definir matriz de permisos por recurso',
    projectId: 'project-a',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Joel Alvarez',
    dueDate: '2026-08-14',
  },
  {
    id: 'task-2',
    title: 'Conectar activity.read con auditoria',
    projectId: 'project-a',
    status: 'todo',
    priority: 'medium',
    assignee: 'Ana Torres',
    dueDate: '2026-08-21',
  },
  {
    id: 'task-3',
    title: 'Resolver ownership de tareas bloqueadas',
    projectId: 'project-b',
    status: 'blocked',
    priority: 'critical',
    assignee: 'Joel Alvarez',
    dueDate: '2026-08-07',
    blockedReason: 'Backend denego tasks.update por contexto del recurso.',
  },
  {
    id: 'task-4',
    title: 'Publicar reporte semanal para clientes',
    projectId: 'project-c',
    status: 'done',
    priority: 'low',
    assignee: 'Nora Patel',
    dueDate: '2026-08-05',
  },
];

export const auditEvents: AuditEvent[] = [
  {
    id: 'audit-1',
    action: 'tasks.complete',
    actor: 'Joel Alvarez',
    projectId: 'project-a',
    status: 'success',
    createdAt: '2026-08-07 15:42',
  },
  {
    id: 'audit-2',
    action: 'members.manage',
    actor: 'Joel Alvarez',
    projectId: 'project-b',
    status: 'denied',
    createdAt: '2026-08-07 14:10',
    metadata: {
      reason: 'No tienes permiso para administrar miembros en este proyecto.',
    },
  },
  {
    id: 'audit-3',
    action: 'projects.archive',
    actor: 'Lucia Gomez',
    projectId: 'project-b',
    status: 'success',
    createdAt: '2026-08-06 18:25',
  },
];

export const roleLabels: Record<ProjectRole, string> = {
  project_manager: 'Project manager',
  developer: 'Developer',
  client: 'Client',
  viewer: 'Viewer',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
  critical: 'Critical',
};

export function getProject(projectId: string) {
  return projects.find((project) => project.id === projectId);
}

export function getProjectTasks(projectId: string) {
  return tasks.filter((task) => task.projectId === projectId);
}

export function getProjectAuditEvents(projectId: string) {
  return auditEvents.filter((event) => event.projectId === projectId);
}

export function getProjectName(projectId: string) {
  return getProject(projectId)?.name ?? 'Proyecto desconocido';
}
