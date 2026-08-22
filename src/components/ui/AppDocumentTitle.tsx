import type * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG } from '@/constants/config';

const pageTitles: Record<string, string> = {
  '/': 'Resumen',
  '/dashboard': 'Resumen',
  '/welcome': 'Mi acceso',
  '/profile': 'Mi perfil',
  '/projects': 'Proyectos',
  '/tasks': 'Tareas',
  '/members': 'Equipos y miembros',
  '/reports': 'Reportes',
  '/activity': 'Auditoría',
  '/crm': 'Resumen comercial',
  '/crm/settings': 'Configuración CRM',
  '/crm/companies': 'Empresas',
  '/crm/contacts': 'Contactos',
  '/crm/leads': 'Leads',
  '/crm/opportunities': 'Oportunidades',
  '/crm/activities': 'Actividades comerciales',
  '/users': 'Usuarios',
  '/roles': 'Roles',
  '/modules': 'Módulos',
  '/actions': 'Acciones',
  '/permissions': 'Permisos',
  '/login': 'Iniciar sesión',
  '/register': 'Crear cuenta',
  '/recover-password': 'Recuperar contraseña',
  '/change-password': 'Cambiar contraseña',
};

const getPageTitle = (pathname: string): string => {
  if (/^\/projects\/[^/]+/.test(pathname)) return 'Detalle del proyecto';
  if (/^\/reset-password\/[^/]+/.test(pathname)) return 'Nueva contraseña';
  return pageTitles[pathname] || 'Página no encontrada';
};

const AppDocumentTitle: React.FC = () => {
  const { pathname } = useLocation();
  const appName = APP_CONFIG.name?.trim() || 'RBAC Workspace';
  const pageTitle = getPageTitle(pathname);

  return (
    <Helmet>
      <html lang="es" />
      <title>{`${appName} · ${pageTitle}`}</title>
      <meta name="application-name" content={appName} />
    </Helmet>
  );
};

export default AppDocumentTitle;
