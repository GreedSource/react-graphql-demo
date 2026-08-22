import * as React from 'react';
import { ArrowForwardRounded, CheckCircleRounded, LockOpenRounded, ManageAccountsRounded, SecurityRounded } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { SIDEBAR_ROUTES, type RouteConfig, type SidebarModule } from '@/config/sidebar-routes.config';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { hasAnyPermission, usePermission } from '@/lib/permissions';

const actionLabels: Record<string, string> = {
  read: 'Consultar',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
  manage: 'Administrar',
  complete: 'Completar',
  archive: 'Archivar',
  convert: 'Convertir',
  close: 'Cerrar',
};

const moduleDescriptions: Record<string, string> = {
  users: 'Gestiona las personas que tienen acceso a la plataforma.',
  roles: 'Define responsabilidades y asigna capacidades por rol.',
  modules: 'Organiza las áreas funcionales disponibles.',
  actions: 'Administra las operaciones que pueden autorizarse.',
  permissions: 'Consulta la matriz de acceso que combina módulos y acciones.',
};

const routeDescription: Record<string, string> = {
  '/': 'Indicadores y actividad del espacio de trabajo.',
  '/projects': 'Da seguimiento a entregas, alcance y responsables.',
  '/tasks': 'Organiza el trabajo diario por estado y prioridad.',
  '/members': 'Controla quién participa en cada proyecto.',
  '/reports': 'Identifica avances, riesgos y bloqueos.',
  '/activity': 'Revisa las decisiones y operaciones registradas.',
  '/crm': 'Mide la actividad comercial de tu organización.',
  '/crm/settings': 'Configura organizaciones y equipos comerciales.',
  '/crm/companies': 'Mantén actualizado el catálogo de empresas.',
  '/crm/contacts': 'Consulta las personas relacionadas con tus cuentas.',
  '/crm/leads': 'Califica prospectos y conviértelos en oportunidades.',
  '/crm/opportunities': 'Administra el pipeline y sus cierres.',
  '/crm/activities': 'Registra llamadas, reuniones y seguimientos.',
  '/profile': 'Actualiza tus datos personales y revisa tu rol.',
  '/users': 'Consulta y actualiza usuarios de la plataforma.',
  '/roles': 'Configura roles y sus permisos asociados.',
  '/permissions': 'Consulta y administra permisos globales.',
  '/modules': 'Define los módulos del catálogo de autorización.',
  '/actions': 'Define las acciones disponibles en cada módulo.',
};

const isRouteConfig = (route: RouteConfig | SidebarModule): route is RouteConfig => 'to' in route;

const WelcomePageContent: React.FC = () => {
  const { user, permissions } = usePermission();
  const roleName = user?.role?.name ?? 'Sin rol asignado';
  const accessibleRoutes = SIDEBAR_ROUTES.flatMap((route) => {
    if (isRouteConfig(route)) {
      return !route.permissionType || !route.permissionActions || hasAnyPermission(permissions, route.permissionType, route.permissionActions) ? [route] : [];
    }
    return route.children.filter((child) => !child.permissionType || !child.permissionActions || hasAnyPermission(permissions, child.permissionType, child.permissionActions));
  });
  const permissionGroups = permissions.reduce<Record<string, string[]>>((groups, permission) => {
    groups[permission.type] = [...(groups[permission.type] ?? []), permission.action];
    return groups;
  }, {});
  const managementPermissions = permissions.filter((permission) => permission.action !== 'read').length;
  const firstName = user?.name || 'tu equipo';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Tu espacio de acceso</p>
            <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Hola, {firstName}.</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">Aquí tienes una vista clara de lo que puedes consultar y administrar. Usa estos accesos para empezar sin perder tiempo buscando en el menú.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Chip icon={<SecurityRounded />} label={`Rol: ${roleName}`} size="small" sx={{ bgcolor: 'var(--accent-soft)', color: 'var(--accent)' }} />
              <span className="text-xs text-text-muted">Los permisos se validan nuevamente en el servidor.</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[290px]">
            <MetricCard label="Permisos" value={permissions.length} icon={<LockOpenRounded />} tone="accent" />
            <MetricCard label="Acciones" value={managementPermissions} detail="Además de consultar" icon={<ManageAccountsRounded />} tone="blue" />
          </div>
        </div>
      </section>

      <SectionCard title="Accesos rápidos" description="Entra directamente a las áreas que tienes habilitadas.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {accessibleRoutes.map((route) => (
            <Link className="group flex items-start gap-3 rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-elevated hover:shadow-sm" key={route.to} to={route.to}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">{route.icon}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-sm font-semibold text-text">{route.label}<ArrowForwardRounded className="text-text-muted transition-transform group-hover:translate-x-1" fontSize="small" /></span>
                <span className="mt-1 block text-xs leading-5 text-text-secondary">{routeDescription[route.to] || 'Abre esta sección para continuar.'}</span>
              </span>
            </Link>
          ))}
        </div>
        {!accessibleRoutes.length ? <div className="rounded-xl border border-dashed border-border p-8 text-center"><p className="font-medium text-text">Todavía no tienes accesos asignados.</p><p className="mt-1 text-sm text-text-secondary">Contacta a un administrador para solicitar un rol.</p></div> : null}
      </SectionCard>

      <SectionCard title="Tu matriz de permisos" description="Entiende qué puedes hacer en cada módulo sin leer claves técnicas.">
        {Object.keys(permissionGroups).length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(permissionGroups).map(([type, actions]) => (
              <article className="rounded-xl border border-border bg-surface-elevated/45 p-4" key={type}>
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><CheckCircleRounded fontSize="small" /></span>
                  <div className="min-w-0">
                    <h3 className="font-semibold capitalize text-text">{type}</h3>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">{moduleDescriptions[type] || 'Capacidades habilitadas para este módulo.'}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {actions.map((action) => <span className="rounded-md bg-surface-card px-2 py-1 text-[11px] font-semibold text-text-secondary" key={`${type}-${action}`}>{actionLabels[action] || action}</span>)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">No hay permisos disponibles para mostrar.</p>
        )}
      </SectionCard>
    </div>
  );
};

export default WelcomePageContent;
