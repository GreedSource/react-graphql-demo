import type * as React from 'react';
import { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
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
    <Link
      to="/profile"
      aria-label="Abrir mi perfil"
      className="mt-3 block shrink-0 rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-surface)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--nav-active)]"
      style={animationStyle}
    >
      <div className="flex items-center gap-3">
        <Avatar
          alt={`${user?.name} ${user?.lastname}`}
          src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
          sx={{ width: 34, height: 34 }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--nav-text)]">
            {user?.name} {user?.lastname}
          </p>
          <p className="truncate text-xs text-[var(--nav-muted)]">{user?.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-[var(--nav-border)] pt-3 text-[11px] text-[var(--nav-muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6ed3a7]" />
        Sesión activa
        <span className="ml-auto text-[var(--nav-muted)]">Ver perfil →</span>
      </div>
    </Link>
  );
};

export default SidebarFooter;
