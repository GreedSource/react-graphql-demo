import { type CSSProperties } from 'react';
import { Avatar } from '@mui/material';
import { useUserStore } from '@/stores/user.store';

interface SidebarFooterProps {
  isMounted: boolean;
  transitionDuration: string;
  transitionTiming: string;
}

export default function SidebarFooter({
  isMounted,
  transitionDuration,
  transitionTiming,
}: SidebarFooterProps) {
  const { user } = useUserStore();

  const animationStyle: CSSProperties = {
    opacity: isMounted ? 1 : 0,
    transform: isMounted ? 'translateY(0)' : 'translateY(8px)',
    transition: `all ${transitionDuration} ${transitionTiming}`,
    transitionDelay: isMounted ? '200ms' : '0ms',
  };

  return (
    <div
      className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/80 transition-all duration-200 hover:border-slate-300 hover:bg-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
      style={animationStyle}
    >
      <Avatar
        alt={`${user?.name} ${user?.lastname}`}
        src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
        sx={{ width: 32, height: 32 }}
        className="transition-transform duration-200 hover:scale-110"
      />
      <div>
        <p className="text-sm font-medium">
          {user?.name} {user?.lastname}
        </p>
        <p className="text-xs text-text-muted">{user?.email}</p>
      </div>
    </div>
  );
}
