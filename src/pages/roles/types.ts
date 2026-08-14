import type { CreateRoleInput, Role } from '@/types/admin';

export interface PermissionItem {
  id: string;
  moduleKey: string;
  actionKey: string;
  description?: string | null;
}

export interface RoleDetailPanelProps {
  selectedRole: Role | undefined;
  permissions: PermissionItem[];
  assignedPermissions: PermissionItem[];
  assignIds: string[];
  removeIds: string[];
  onAssignIdsChange: (ids: string[]) => void;
  onRemoveIdsChange: (ids: string[]) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSavePermissions: () => void;
  permissionsLoading: boolean;
}

export interface RoleFormFieldsProps {
  formState: CreateRoleInput & { id?: string };
  onChange: (state: CreateRoleInput & { id?: string }) => void;
}
