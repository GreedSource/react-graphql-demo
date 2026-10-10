import type * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { usePermission, hasAnyPermission } from '@/lib/permissions';
import type { SidebarModule } from '@/config/sidebar-routes.config';
import SidebarItem from './sidebar-item';
import { activeChildRoute } from '@/lib/navigation';

interface SidebarModuleItemProps {
  module: SidebarModule;
  delay?: number;
}

const SidebarModuleItem: React.FC<SidebarModuleItemProps> = ({
  module,
  delay = 0,
}) => {
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

  const activeRoute = activeChildRoute(location.pathname, filteredChildren.map((child) => child.to));
  const isAnyChildActive = Boolean(activeRoute);
  const [expanded, setExpanded] = useState(isAnyChildActive);
  const [isVisible, setIsVisible] = useState(false);
  const contentId = `sidebar-${module.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

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
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded(!expanded)}
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
          isAnyChildActive
            ? 'bg-[var(--nav-active)] text-[var(--nav-text)]'
            : 'text-[var(--nav-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--nav-text)]'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`grid h-7 w-7 place-items-center rounded-xl [&_.MuiSvgIcon-root]:text-[19px] ${isAnyChildActive ? 'bg-[var(--nav-icon-active)] text-[var(--accent-hover)]' : 'text-[var(--nav-muted)]'}`}>
            {module.icon}
          </span>
          <span>{module.label}</span>
        </div>
        <span
          className="text-lg text-[var(--nav-muted)] transition-transform duration-300"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ExpandMore />
        </span>
      </button>
      <div
        id={contentId}
        style={{
          height: `${contentHeight}px`,
          overflow: 'hidden',
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          ref={contentRef}
          className="ml-4 mt-1 space-y-1 border-l border-[var(--nav-border)] pl-3"
        >
          {filteredChildren.map((child, index) => (
            <SidebarItem
              key={child.to}
              to={child.to}
              icon={child.icon}
              label={child.label}
              active={activeRoute === child.to}
              delay={expanded ? index * 50 : 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarModuleItem;
