import type { ProjectRole, TaskPriority, TaskStatus } from '@/types/project-platform';

export const roleLabels: Record<ProjectRole, string> = { project_manager: 'Líder de proyecto', developer: 'Desarrollo', client: 'Cliente', viewer: 'Consulta' };
export const taskStatusLabels: Record<TaskStatus, string> = { todo: 'Por hacer', in_progress: 'En curso', blocked: 'Bloqueadas', done: 'Completadas' };
export const priorityLabels: Record<TaskPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente', critical: 'Crítica' };
