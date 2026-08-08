import type * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermission } from '@/lib/permissions';
import { hasAnyPermission } from '@/lib/permissions';

interface PermissionRouteGuardProps {
  permissionType: string;
  permissionActions: string[];
  fallbackPath?: string;
}

/**
 * A route guard that checks if the user has the required permission.
 * If not, redirects to the fallback path (default: /welcome).
 */
const PermissionRouteGuard: React.FC<PermissionRouteGuardProps> = ({
  permissionType,
  permissionActions,
  fallbackPath = '/welcome',
}) => {
  const { user } = usePermission();
  const userPermissions = user?.role?.permissions ?? [];

  const hasAccess = hasAnyPermission(userPermissions, permissionType, permissionActions);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default PermissionRouteGuard;
