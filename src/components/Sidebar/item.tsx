import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import { usePermission, hasAnyPermission } from '@/lib/permissions';
import { SIDEBAR_ROUTES } from '@/config/sidebar-routes.config';
import type { RouteConfig, SidebarModule } from '@/config/sidebar-routes.config';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  to: string;
  delay?: number;
}

function SidebarItem({ icon, label, active, to, delay = 0 }: SidebarItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-sky-500/15 text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <span className="text-lg transition-transform duration-200 hover:scale-110">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

interface SidebarModuleItemProps {
  module: SidebarModule;
  delay?: number;
}

function SidebarModuleItem({ module, delay = 0 }: SidebarModuleItemProps) {
  const location = useLocation();
  const { user } = usePermission();
  const userPermissions = user?.role?.permissions ?? [];
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const filteredChildren = module.children.filter((child) => {
    if (!child.permissionType || !child.permissionActions) {
      return true;
    }
    return hasAnyPermission(userPermissions, child.permissionType, child.permissionActions);
  });

  const isAnyChildActive = filteredChildren.some((child) => location.pathname === child.to);
  const [expanded, setExpanded] = useState(isAnyChildActive);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isAnyChildActive) {
      setExpanded(true);
    }
  }, [isAnyChildActive]);

  useEffect(() => {
    if (expanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [expanded, filteredChildren]);

  if (filteredChildren.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
        transition: `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
          isAnyChildActive
            ? 'bg-sky-500/15 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg transition-transform duration-200 hover:scale-110">{module.icon}</span>
          <span>{module.label}</span>
        </div>
        <span
          className="text-lg transition-transform duration-300"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ExpandMore />
        </span>
      </button>
      <div
        style={{
          height: `${contentHeight}px`,
          overflow: 'hidden',
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          ref={contentRef}
          className="ml-6 mt-1 space-y-1 border-l border-slate-800 pl-4"
        >
          {filteredChildren.map((child, index) => (
            <SidebarItem
              key={child.to}
              to={child.to}
              icon={child.icon}
              label={child.label}
              active={location.pathname === child.to}
              delay={expanded ? index * 50 : 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SidebarRoutes() {
  const location = useLocation();
  const { user } = usePermission();
  const userPermissions = user?.role?.permissions ?? [];

  const filteredRoutes = SIDEBAR_ROUTES.filter((route) => {
    if ('children' in route) {
      const module = route as SidebarModule;
      if (module.permissionType && module.permissionActions) {
        return hasAnyPermission(userPermissions, module.permissionType, module.permissionActions);
      }
      return module.children.some((child) => {
        if (!child.permissionType || !child.permissionActions) {
          return true;
        }
        return hasAnyPermission(userPermissions, child.permissionType, child.permissionActions);
      });
    }

    const item = route as RouteConfig;
    if (!item.permissionType || !item.permissionActions) {
      return true;
    }
    return hasAnyPermission(userPermissions, item.permissionType, item.permissionActions);
  });

  return (
    <nav className="space-y-2">
      {filteredRoutes.map((route, index) => {
        if ('children' in route) {
          return <SidebarModuleItem key={route.label} module={route as SidebarModule} delay={index * 60 + 100} />;
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
