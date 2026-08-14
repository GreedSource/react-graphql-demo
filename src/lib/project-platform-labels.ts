import type { ProjectRole, TaskPriority, TaskStatus } from '@/types/project-platform';

export const roleLabels: Record<ProjectRole, string> = { project_manager: 'Project manager', developer: 'Developer', client: 'Client', viewer: 'Viewer' };
export const taskStatusLabels: Record<TaskStatus, string> = { todo: 'To do', in_progress: 'In progress', blocked: 'Blocked', done: 'Done' };
export const priorityLabels: Record<TaskPriority, string> = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent', critical: 'Critical' };
