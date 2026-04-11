import { useUserStore } from '@/stores/user.store';

/**
 * Check if a user has a specific permission
 * @param permissions - Array of permissions from user.role.permissions
 * @param type - The module type (e.g., 'users', 'roles')
 * @param action - The action (e.g., 'read', 'create', 'update', 'delete')
 */
export function hasPermission(
  permissions: Array<{ type: string; action: string }>,
  type: string,
  action: string
): boolean {
  return permissions.some(
    (perm) => perm.type === type && perm.action === action
  );
}

/**
 * Check if a user has ANY of the specified actions for a module type
 * @param permissions - Array of permissions from user.role.permissions
 * @param type - The module type (e.g., 'users', 'roles')
 * @param actions - Array of actions to check (e.g., ['read', 'create'])
 */
export function hasAnyPermission(
  permissions: Array<{ type: string; action: string }>,
  type: string,
  actions: string[]
): boolean {
  return actions.some((action) => hasPermission(permissions, type, action));
}

/**
 * Check if a user has ALL of the specified actions for a module type
 */
export function hasAllPermissions(
  permissions: Array<{ type: string; action: string }>,
  type: string,
  actions: string[]
): boolean {
  return actions.every((action) => hasPermission(permissions, type, action));
}

/**
 * Hook to check permissions for the current user
 */
export function usePermission() {
  const { user } = useUserStore();
  const permissions = user?.role?.permissions ?? [];

  const checkPermission = (type: string, action: string) =>
    hasPermission(permissions, type, action);

  const checkAnyPermission = (type: string, actions: string[]) =>
    hasAnyPermission(permissions, type, actions);

  const checkAllPermissions = (type: string, actions: string[]) =>
    hasAllPermissions(permissions, type, actions);

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    permissions,
    user,
  };
}
