import type { ReactNode } from 'react';
import {
  AdminPanelSettings,
  Badge,
  Bolt,
  Dashboard,
  DatasetLinked,
  Extension,
  Groups,
  ManageAccounts,
  People,
  QueryStats,
  Shield,
  TaskAlt,
  Workspaces,
  History,
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
    label: 'Dashboard',
    to: '/',
    icon: <Dashboard />,
    permissionType: null,
    permissionActions: null,
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: <Workspaces />,
    permissionType: 'projects',
    permissionActions: ['read'],
  },
  {
    label: 'Tasks',
    to: '/tasks',
    icon: <TaskAlt />,
    permissionType: 'tasks',
    permissionActions: ['read'],
  },
  {
    label: 'Teams / Members',
    to: '/members',
    icon: <People />,
    permissionType: 'members',
    permissionActions: ['read'],
  },
  {
    label: 'Reports',
    to: '/reports',
    icon: <QueryStats />,
    permissionType: 'reports',
    permissionActions: ['read'],
  },
  {
    label: 'Activity / Audit Logs',
    to: '/activity',
    icon: <History />,
    permissionType: 'activity',
    permissionActions: ['read'],
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <Badge />,
    permissionType: null,
    permissionActions: null,
  },
  {
    label: 'Administration',
    icon: <AdminPanelSettings />,
    permissionType: null,
    permissionActions: null,
    children: [
      {
        label: 'Users',
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
        label: 'Permissions',
        to: '/permissions',
        icon: <Extension />,
        permissionType: 'permissions',
        permissionActions: ['read'],
      },
      {
        label: 'Modules',
        to: '/modules',
        icon: <DatasetLinked />,
        permissionType: 'modules',
        permissionActions: ['read'],
      },
      {
        label: 'Actions',
        to: '/actions',
        icon: <Bolt />,
        permissionType: 'actions',
        permissionActions: ['read'],
      },
      {
        label: 'My Access',
        to: '/welcome',
        icon: <ManageAccounts />,
        permissionType: null,
        permissionActions: null,
      },
    ],
  },
];
