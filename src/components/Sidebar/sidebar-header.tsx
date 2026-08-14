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
    <div style={animationStyle}>
      <div className="mb-5 px-2 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-400 text-sm font-black text-slate-950">
            P
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Control center
            </p>
            <span className="block truncate text-base font-semibold text-white">
              {APP_CONFIG.name || 'RBAC Platform'}
            </span>
          </div>
        </div>
      </div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Workspace</p>
      <SidebarRoutes />
    </div>
  );
};

export default SidebarHeader;
