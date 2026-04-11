import type { ReactNode } from 'react';
import {
  AdminPanelSettings,
  Badge,
  Bolt,
  DatasetLinked,
  Extension,
  Groups,
  Shield,
  PeopleAlt,
} from '@mui/icons-material';

/**
 * Configuration for each route in the sidebar.
 *
 * - `permissionType`: The module type required to access this route (e.g., 'users', 'roles')
 * - `permissionActions`: The actions that grant access. If the user has ANY of these actions
 *   for the given type, they can see/access the route.
 * - If both `permissionType` and `permissionActions` are null, the route is always accessible
 *   (e.g., dashboard, profile).
 */
export interface RouteConfig {
  label: string;
  to: string;
  icon: ReactNode;
  permissionType: string | null;
  permissionActions: string[] | null;
}

/**
 * A sidebar module that can contain child routes.
 */
export interface SidebarModule {
  label: string;
  icon: ReactNode;
  permissionType: string | null;
  permissionActions: string[] | null;
  children: RouteConfig[];
}

/**
 * Sidebar route definitions.
 * Each item can be a direct route or a module with children.
 */
export const SIDEBAR_ROUTES: (RouteConfig | SidebarModule)[] = [
  {
    label: 'Resumen',
    to: '/',
    icon: <AdminPanelSettings />,
    permissionType: null,
    permissionActions: null,
  },
  {
    label: 'Perfil',
    to: '/profile',
    icon: <Badge />,
    permissionType: null,
    permissionActions: null,
  },
  {
    label: 'Staff',
    icon: <PeopleAlt />,
    permissionType: null,
    permissionActions: null,
    children: [
      {
        label: 'Usuarios',
        to: '/users',
        icon: <Groups />,
        permissionType: 'users',
        permissionActions: ['read'],
      },
      {
        label: 'Roles',
        to: '/roles',
        icon: <Shield />,
        permissionType: 'roles',
        permissionActions: ['read'],
      },
      {
        label: 'Modulos',
        to: '/modules',
        icon: <DatasetLinked />,
        permissionType: 'modules',
        permissionActions: ['read'],
      },
      {
        label: 'Acciones',
        to: '/actions',
        icon: <Bolt />,
        permissionType: 'actions',
        permissionActions: ['read'],
      },
      {
        label: 'Permisos',
        to: '/permissions',
        icon: <Extension />,
        permissionType: 'permissions',
        permissionActions: ['read'],
      },
    ],
  },
];
