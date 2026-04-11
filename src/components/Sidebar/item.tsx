import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AdminPanelSettings,
  Badge,
  Bolt,
  DatasetLinked,
  Extension,
  Groups,
  Shield,
} from '@mui/icons-material';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  to: string;
}

function SidebarItem({ icon, label, active, to }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'bg-sky-500/15 text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

const routes = [
  { label: 'Resumen', to: '/', icon: <AdminPanelSettings /> },
  { label: 'Perfil', to: '/profile', icon: <Badge /> },
  { label: 'Usuarios', to: '/users', icon: <Groups /> },
  { label: 'Roles', to: '/roles', icon: <Shield /> },
  { label: 'Modulos', to: '/modules', icon: <DatasetLinked /> },
  { label: 'Acciones', to: '/actions', icon: <Bolt /> },
  { label: 'Permisos', to: '/permissions', icon: <Extension /> },
];

export default function SidebarRoutes() {
  const location = useLocation();

  return (
    <nav className="space-y-2">
      {routes.map(({ label, to, icon }) => (
        <SidebarItem
          key={to}
          to={to}
          icon={icon}
          label={label}
          active={location.pathname === to}
        />
      ))}
    </nav>
  );
}
