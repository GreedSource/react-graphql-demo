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
      className={`group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-white/[0.13] text-white shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[var(--accent)]'
          : 'text-white/62 hover:translate-x-0.5 hover:bg-white/[0.07] hover:text-white'
      }`}
    >
      <span
        className={`grid h-6 w-6 place-items-center text-base transition-colors [&_.MuiSvgIcon-root]:text-[19px] ${
          active
            ? 'text-indigo-200'
            : 'text-white/42 group-hover:text-white/80'
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
