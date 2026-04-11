export interface ApiResponse<T> {
  status: number;
  message?: string | null;
  data: T;
}

export interface RolePermissionSummary {
  type: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  permissions: RolePermissionSummary[];
}

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role?: Role | null;
}

export interface ModuleEntity {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  active: boolean;
}

export interface ActionEntity {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  active: boolean;
}

export interface Permission {
  id: string;
  moduleKey: string;
  actionKey: string;
  description?: string | null;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  lastname?: string;
  roleId?: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateRoleInput {
  id: string;
  name?: string;
  description?: string;
  active?: boolean;
}

export interface CreateModuleInput {
  name: string;
  key: string;
  description?: string;
  active?: boolean;
}

export interface UpdateModuleInput {
  id: string;
  name?: string;
  key?: string;
  description?: string;
  active?: boolean;
}

export interface CreateActionInput {
  name: string;
  key: string;
  description?: string;
  active?: boolean;
}

export interface CreatePermissionInput {
  moduleId: string;
  actionId: string;
  description?: string;
}
