import type * as React from 'react';
import { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import SidebarRoutes from './item';
import { APP_CONFIG } from '@/constants/config';

interface SidebarHeaderProps {
  isMounted: boolean;
  transitionDuration: string;
  transitionTiming: string;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isMounted,
  transitionDuration,
  transitionTiming,
}) => {
  const animationStyle: CSSProperties = {
    opacity: isMounted ? 1 : 0,
    transform: isMounted ? 'translateY(0)' : 'translateY(-8px)',
    transition: `all ${transitionDuration} ${transitionTiming}`,
    transitionDelay: isMounted ? '100ms' : '0ms',
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={animationStyle}>
      <div className="mb-5 shrink-0 px-1 pt-1">
        <Link
          to="/"
          aria-label="Ir al resumen"
          className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-[var(--nav-hover)]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,var(--accent),#f4a68d)] text-lg font-black text-white shadow-lg shadow-black/20 transition-transform duration-200 group-hover:rotate-3 group-hover:scale-105">
            {(APP_CONFIG.name || 'Workspace').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--nav-muted)]">
              Workspace
            </p>
            <span className="block truncate text-[15px] font-bold text-[var(--nav-text)]">
              {APP_CONFIG.name || 'RBAC Platform'}
            </span>
          </div>
        </Link>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-surface)] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--nav-muted)]">
              Espacio activo
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-[var(--nav-text)]">
              Operación general
            </p>
          </div>
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#6ed3a7] shadow-[0_0_0_4px_rgba(110,211,167,0.14)]" aria-label="Activo" />
        </div>
      </div>
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nav-muted)]">Secciones</p>
      <div className="sidebar-scroll-area min-h-0 flex-1 overflow-y-auto pr-1">
        <SidebarRoutes />
      </div>
    </div>
  );
};

export default SidebarHeader;
