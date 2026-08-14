import type * as React from 'react';
import { type CSSProperties } from 'react';
import { Avatar } from '@mui/material';
import { useUserStore } from '@/stores/user.store';

interface SidebarFooterProps {
  isMounted: boolean;
  transitionDuration: string;
  transitionTiming: string;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isMounted,
  transitionDuration,
  transitionTiming,
}) => {
  const { user } = useUserStore();

  const animationStyle: CSSProperties = {
    opacity: isMounted ? 1 : 0,
    transform: isMounted ? 'translateY(0)' : 'translateY(8px)',
    transition: `all ${transitionDuration} ${transitionTiming}`,
    transitionDelay: isMounted ? '200ms' : '0ms',
  };

  return (
    <div
      className="rounded-md border border-white/10 bg-white/[0.05] p-3 transition-colors hover:bg-white/[0.08]"
      style={animationStyle}
    >
      <div className="flex items-center gap-3">
        <Avatar
          alt={`${user?.name} ${user?.lastname}`}
          src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
          sx={{ width: 34, height: 34 }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {user?.name} {user?.lastname}
          </p>
          <p className="truncate text-xs text-white/45">{user?.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[11px] text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Sesion activa
      </div>
    </div>
  );
};

export default SidebarFooter;
