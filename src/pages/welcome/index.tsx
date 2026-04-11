import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Groups,
  Shield,
  DatasetLinked,
  Bolt,
  Extension,
  ArrowForward,
} from '@mui/icons-material';
import { usePermission } from '@/lib/permissions';
import { hasAnyPermission } from '@/lib/permissions';
import { SIDEBAR_ROUTES } from '@/config/sidebar-routes.config';
import type { SidebarModule } from '@/config/sidebar-routes.config';

const moduleIcons: Record<string, React.ReactNode> = {
  users: <Groups fontSize="large" />,
  roles: <Shield fontSize="large" />,
  modules: <DatasetLinked fontSize="large" />,
  actions: <Bolt fontSize="large" />,
  permissions: <Extension fontSize="large" />,
};

export default function WelcomePage() {
  const { user } = usePermission();
  const userPermissions = user?.role?.permissions ?? [];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Get all accessible child routes from Staff module
  const staffModule = SIDEBAR_ROUTES.find(
    (route) => route.label === 'Staff'
  ) as SidebarModule | undefined;

  const accessibleModules = staffModule?.children.filter((child) => {
    if (!child.permissionType || !child.permissionActions) {
      return true;
    }
    return hasAnyPermission(userPermissions, child.permissionType, child.permissionActions);
  }) ?? [];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl text-center">
        <h1
          className="text-4xl font-bold text-white sm:text-5xl"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Welcome, {user?.name} {user?.lastname}
        </h1>
        <p
          className="mt-4 text-lg text-slate-400"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: isVisible ? '100ms' : '0ms',
          }}
        >
          You have access to the following modules. Select one to get started.
        </p>

        {accessibleModules.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {accessibleModules.map((route, index) => (
              <Link
                key={route.to}
                to={route.to}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
                  transition: `opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
                  transitionDelay: isVisible ? `${(index + 2) * 100}ms` : '0ms',
                }}
              >
                <span className="text-sky-400 transition-all duration-300 group-hover:text-sky-300 group-hover:scale-110">
                  {route.icon || moduleIcons[route.permissionType!] || <Bolt fontSize="large" />}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{route.label}</h3>
                  <p className="mt-2 flex items-center justify-center gap-1 text-sm text-slate-400">
                    Open module
                    <ArrowForward
                      fontSize="small"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-12"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: isVisible ? '300ms' : '0ms',
            }}
          >
            <p className="text-lg text-slate-400">
              You don't have access to any modules yet. Please contact an administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
