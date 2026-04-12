import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import { usePermission, hasAnyPermission } from '@/lib/permissions';
import type { SidebarModule } from '@/config/sidebar-routes.config';
import SidebarItem from './sidebar-item';

interface SidebarModuleItemProps {
  module: SidebarModule;
  delay?: number;
}

export default function SidebarModuleItem({
  module,
  delay = 0,
}: SidebarModuleItemProps) {
  const location = useLocation();
  const { user } = usePermission();
  const userPermissions = user?.role?.permissions ?? [];
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const filteredChildren = module.children.filter((child) => {
    if (!child.permissionType || !child.permissionActions) {
      return true;
    }
    return hasAnyPermission(
      userPermissions,
      child.permissionType,
      child.permissionActions,
    );
  });

  const isAnyChildActive = filteredChildren.some(
    (child) => location.pathname === child.to,
  );
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
        className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
          isAnyChildActive
            ? 'bg-sky-500/15 text-sky-700 dark:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg transition-transform duration-200 hover:scale-110">
            {module.icon}
          </span>
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
          className="ml-6 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800 pl-4"
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
