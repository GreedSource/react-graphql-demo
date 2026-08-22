import type * as React from 'react';
import { type CSSProperties } from 'react';
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
      <div className="mb-5 shrink-0 px-2 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-black text-white shadow-lg shadow-indigo-950/20">
            R
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Centro de control
            </p>
            <span className="block truncate text-base font-semibold text-white">
              {APP_CONFIG.name || 'RBAC Platform'}
            </span>
          </div>
        </div>
      </div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Navegación</p>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.16)_transparent]">
        <SidebarRoutes />
      </div>
    </div>
  );
};

export default SidebarHeader;
