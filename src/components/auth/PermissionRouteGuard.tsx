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
export default function PermissionRouteGuard({
  permissionType,
  permissionActions,
  fallbackPath = '/welcome',
}: PermissionRouteGuardProps) {
  const { user } = usePermission();
  const userPermissions = user?.role?.permissions ?? [];

  const hasAccess = hasAnyPermission(userPermissions, permissionType, permissionActions);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
