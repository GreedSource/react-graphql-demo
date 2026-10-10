import type * as React from 'react';
import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  to: string;
  delay?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  to,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-[var(--nav-active)] text-[var(--nav-text)] shadow-sm before:absolute before:inset-y-2.5 before:left-0 before:w-1 before:rounded-full before:bg-[var(--accent)]'
          : 'text-[var(--nav-muted)] hover:translate-x-0.5 hover:bg-[var(--nav-hover)] hover:text-[var(--nav-text)]'
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-xl text-base transition-colors [&_.MuiSvgIcon-root]:text-[19px] ${
          active
            ? 'bg-[var(--nav-icon-active)] text-[var(--accent-hover)]'
            : 'text-[var(--nav-muted)] group-hover:bg-[var(--nav-icon-active)] group-hover:text-[var(--nav-text)]'
        }`}
      >
        {icon}
      </span>
      <span
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: `${delay}ms`,
        }}
      >
        {label}
      </span>
    </Link>
  );
};

export default SidebarItem;
