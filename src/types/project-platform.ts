export type ProjectRole =
  | 'project_manager'
  | 'developer'
  | 'client'
  | 'viewer';

export type ProjectStatus = 'active' | 'at_risk' | 'archived';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  projectRole: ProjectRole;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  contextualRole: ProjectRole;
  summary: string;
  members: ProjectMember[];
}

export interface ProjectTask {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  blockedReason?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  projectId: string;
  status: 'success' | 'denied';
  createdAt: string;
  metadata?: {
    reason?: string;
  };
}
