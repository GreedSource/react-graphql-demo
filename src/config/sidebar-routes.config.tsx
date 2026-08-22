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
  BusinessCenter,
  CorporateFare,
  ContactPage,
  TrendingUp,
  Paid,
  EventNote,
  SettingsSuggest,
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
    icon: <Dashboard />,
    permissionType: null,
    permissionActions: null,
  },
  {
    label: 'Proyectos',
    to: '/projects',
    icon: <Workspaces />,
    permissionType: 'projects',
    permissionActions: ['read'],
  },
  {
    label: 'Tareas',
    to: '/tasks',
    icon: <TaskAlt />,
    permissionType: 'tasks',
    permissionActions: ['read'],
  },
  {
    label: 'Equipos y miembros',
    to: '/members',
    icon: <People />,
    permissionType: 'members',
    permissionActions: ['read'],
  },
  {
    label: 'Reportes',
    to: '/reports',
    icon: <QueryStats />,
    permissionType: 'reports',
    permissionActions: ['read'],
  },
  {
    label: 'Actividad y auditoría',
    to: '/activity',
    icon: <History />,
    permissionType: 'activity',
    permissionActions: ['read'],
  },
  {
    label: 'CRM comercial',
    icon: <BusinessCenter />,
    permissionType: null,
    permissionActions: null,
    children: [
      { label: 'Configuración', to: '/crm/settings', icon: <SettingsSuggest />, permissionType: 'modules', permissionActions: ['read', 'create'] },
      { label: 'Resumen comercial', to: '/crm', icon: <Dashboard />, permissionType: 'dashboard', permissionActions: ['read'] },
      { label: 'Empresas', to: '/crm/companies', icon: <CorporateFare />, permissionType: 'companies', permissionActions: ['read'] },
      { label: 'Contactos', to: '/crm/contacts', icon: <ContactPage />, permissionType: 'contacts', permissionActions: ['read'] },
      { label: 'Leads', to: '/crm/leads', icon: <TrendingUp />, permissionType: 'leads', permissionActions: ['read'] },
      { label: 'Oportunidades', to: '/crm/opportunities', icon: <Paid />, permissionType: 'opportunities', permissionActions: ['read'] },
      { label: 'Actividades', to: '/crm/activities', icon: <EventNote />, permissionType: 'activities', permissionActions: ['read'] },
    ],
  },
  {
    label: 'Mi perfil',
    to: '/profile',
    icon: <Badge />,
    permissionType: null,
    permissionActions: null,
  },
  {
    label: 'Administración',
    icon: <AdminPanelSettings />,
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
        label: 'Permisos',
        to: '/permissions',
        icon: <Extension />,
        permissionType: 'permissions',
        permissionActions: ['read'],
      },
      {
        label: 'Módulos',
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
        label: 'Mi acceso',
        to: '/welcome',
        icon: <ManageAccounts />,
        permissionType: null,
        permissionActions: null,
      },
    ],
  },
];
