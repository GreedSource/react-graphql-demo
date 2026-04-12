import { type CSSProperties } from 'react';
import SidebarRoutes from './item';
import { APP_CONFIG } from '@/constants/config';

interface SidebarHeaderProps {
  isMounted: boolean;
  transitionDuration: string;
  transitionTiming: string;
}

export default function SidebarHeader({
  isMounted,
  transitionDuration,
  transitionTiming,
}: SidebarHeaderProps) {
  const animationStyle: CSSProperties = {
    opacity: isMounted ? 1 : 0,
    transform: isMounted ? 'translateY(0)' : 'translateY(-8px)',
    transition: `all ${transitionDuration} ${transitionTiming}`,
    transitionDelay: isMounted ? '100ms' : '0ms',
  };

  return (
    <div style={animationStyle}>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-lg font-bold text-sky-600 dark:text-sky-300 transition-all duration-200 hover:scale-105 hover:bg-sky-500/30">
          GA
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">
            Control center
          </p>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">
            {APP_CONFIG.name || 'GraphQL Admin'}
          </span>
        </div>
      </div>
      <SidebarRoutes />
    </div>
  );
}
