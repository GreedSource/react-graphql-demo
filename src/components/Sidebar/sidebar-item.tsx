import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  to: string;
  delay?: number;
}

export default function SidebarItem({
  icon,
  label,
  active,
  to,
  delay = 0,
}: SidebarItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
        active
          ? 'bg-sky-500/15 text-sky-700 dark:text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      <span className="text-lg transition-transform duration-200 hover:scale-110">
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
}
