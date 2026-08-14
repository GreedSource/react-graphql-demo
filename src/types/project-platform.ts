export type ProjectRole =
  | 'project_manager'
  | 'developer'
  | 'client'
  | 'viewer';

export type ProjectStatus = 'active' | 'at_risk' | 'archived';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

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

export interface TaskEntity {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  createdById?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpdateTaskInput {
  id: string;
  projectId?: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface ProjectEntity { id: string; name: string; description?: string | null; status: string; ownerId: string; archivedAt?: string | null; createdAt?: string | null; updatedAt?: string | null; }
export interface CreateProjectInput { name: string; description?: string; ownerId: string; }
export interface UpdateProjectInput { id: string; name?: string; description?: string; status?: string; ownerId?: string; }
export interface ProjectRoleEntity { id: string; name: string; description?: string | null; active?: boolean; }
export interface ProjectMemberEntity { id: string; projectId: string; userId: string; projectRoleId: string; projectRole: ProjectRoleEntity; createdAt?: string | null; updatedAt?: string | null; }
export interface AddProjectMemberInput { projectId: string; userId: string; projectRoleId: string; }
export interface UpdateProjectMemberRoleInput { id: string; projectRoleId: string; }
export interface AuditLogEntity { id: string; userId?: string | null; module: string; action: string; resourceType?: string | null; resourceId?: string | null; status: string; metadata?: unknown; createdAt: string; }
export interface CreateTaskInput { projectId: string; title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; assigneeId?: string; dueDate?: string; }

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
