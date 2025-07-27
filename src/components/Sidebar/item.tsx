import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  Folder,
  CalendarToday,
  Description,
  BarChart,
  Dashboard,
} from '@mui/icons-material';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  to: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  badge,
  active,
  to,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center md:justify-start px-0 md:px-3 md:py-3 rounded-md text-sm font-medium space-x-0 md:space-x-3 transition-colors duration-200 ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden md:inline">{label}</span>
      {badge && (
        <span className="ml-auto rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white hidden md:inline">
          {badge}
        </span>
      )}
    </Link>
  );
};

const routes = [
  { label: 'Home', to: '/', icon: <Home /> },
  { label: 'Dashboard', to: '/dashboard', icon: <Dashboard /> },
  { label: 'Projects', to: '/projects', icon: <Folder />, badge: '12' },
  { label: 'Calendar', to: '/calendar', icon: <CalendarToday />, badge: '20+' },
  { label: 'Documents', to: '/documents', icon: <Description /> },
  { label: 'Reports', to: '/reports', icon: <BarChart /> },
];

export default function SidebarRoutes() {
  const location = useLocation();

  return (
    <nav className="space-y-2">
      {routes.map(({ label, to, icon, badge }) => (
        <SidebarItem
          key={to}
          to={to}
          icon={icon}
          label={label}
          badge={badge}
          active={location.pathname === to}
        />
      ))}
    </nav>
  );
}
