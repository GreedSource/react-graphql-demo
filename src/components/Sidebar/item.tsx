import { useLocation } from 'react-router-dom';
import { usePermission, hasAnyPermission } from '@/lib/permissions';
import { SIDEBAR_ROUTES } from '@/config/sidebar-routes.config';
import type {
  RouteConfig,
  SidebarModule,
} from '@/config/sidebar-routes.config';
import SidebarItem from './sidebar-item';
import SidebarModuleItem from './sidebar-module-item';

export default function SidebarRoutes() {
  const location = useLocation();
  const { user } = usePermission();
  const userPermissions = user?.role?.permissions ?? [];

  const filteredRoutes = SIDEBAR_ROUTES.filter((route) => {
    if ('children' in route) {
      const module = route as SidebarModule;
      if (module.permissionType && module.permissionActions) {
        return hasAnyPermission(
          userPermissions,
          module.permissionType,
          module.permissionActions,
        );
      }
      return module.children.some((child) => {
        if (!child.permissionType || !child.permissionActions) {
          return true;
        }
        return hasAnyPermission(
          userPermissions,
          child.permissionType,
          child.permissionActions,
        );
      });
    }

    const item = route as RouteConfig;
    if (!item.permissionType || !item.permissionActions) {
      return true;
    }
    return hasAnyPermission(
      userPermissions,
      item.permissionType,
      item.permissionActions,
    );
  });

  return (
    <nav className="space-y-2">
      {filteredRoutes.map((route, index) => {
        if ('children' in route) {
          return (
            <SidebarModuleItem
              key={route.label}
              module={route as SidebarModule}
              delay={index * 60 + 100}
            />
          );
        }
        const item = route as RouteConfig;
        return (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.to}
            delay={index * 60 + 100}
          />
        );
      })}
    </nav>
  );
}
