import type { Permission } from '@/types/admin';

export interface PermissionFormState {
  moduleId: string;
  actionId: string;
  description: string;
}

export interface PermissionCardProps {
  permission: Permission;
  onDelete: (permission: Permission) => void;
}
