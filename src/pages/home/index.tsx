import {
  Bolt,
  DatasetLinked,
  Extension,
  Groups,
  Shield,
} from '@mui/icons-material';
import { Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useProfileQuery } from '@/hooks/auth.hook';
import { useActions } from '@/hooks/action.hook';
import { useModules } from '@/hooks/module.hook';
import { usePermissions } from '@/hooks/permission.hook';
import { useRoles } from '@/hooks/role.hook';
import { useUsers } from '@/hooks/user.hook';
import { usePermission, hasAnyPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { getApolloErrorMessage } from '@/lib/graphql';

export default function HomePage() {
  const profileQuery = useProfileQuery();
  const { user } = usePermission();

  const profile = profileQuery.data?.profile?.data;
  const userPermissions = user?.role?.permissions ?? [];

  // Only fetch data if user has the corresponding read permission
  const canReadUsers = hasAnyPermission(userPermissions, 'users', ['read']);
  const canReadRoles = hasAnyPermission(userPermissions, 'roles', ['read']);
  const canReadModules = hasAnyPermission(userPermissions, 'modules', ['read']);
  const canReadActions = hasAnyPermission(userPermissions, 'actions', ['read']);
  const canReadPermissions = hasAnyPermission(userPermissions, 'permissions', [
    'read',
  ]);

  const usersQuery = useUsers(!canReadUsers);
  const rolesQuery = useRoles(!canReadRoles);
  const modulesQuery = useModules(!canReadModules);
  const actionsQuery = useActions(!canReadActions);
  const permissionsQuery = usePermissions(!canReadPermissions);

  // Filter cards based on user permissions
  const cards = [
    {
      label: 'Usuarios',
      count: usersQuery.data?.users?.data.length ?? 0,
      icon: <Groups />,
      to: '/users',
      permissionType: 'users',
      permissionActions: ['read'],
    },
    {
      label: 'Roles',
      count: rolesQuery.data?.roles?.data.length ?? 0,
      icon: <Shield />,
      to: '/roles',
      permissionType: 'roles',
      permissionActions: ['read'],
    },
    {
      label: 'Modulos',
      count: modulesQuery.data?.modules?.data.length ?? 0,
      icon: <DatasetLinked />,
      to: '/modules',
      permissionType: 'modules',
      permissionActions: ['read'],
    },
    {
      label: 'Acciones',
      count: actionsQuery.data?.actions?.data.length ?? 0,
      icon: <Bolt />,
      to: '/actions',
      permissionType: 'actions',
      permissionActions: ['read'],
    },
    {
      label: 'Permisos',
      count: permissionsQuery.data?.permissions?.data.length ?? 0,
      icon: <Extension />,
      to: '/permissions',
      permissionType: 'permissions',
      permissionActions: ['read'],
    },
  ].filter((card) =>
    hasAnyPermission(
      userPermissions,
      card.permissionType,
      card.permissionActions,
    ),
  );

  // Build integration status message based on permissions
  const integrations = [
    { name: 'Auth', enabled: true }, // Auth is always available
    { name: 'Usuarios', enabled: canReadUsers },
    { name: 'Roles', enabled: canReadRoles },
    { name: 'Módulos', enabled: canReadModules },
    { name: 'Acciones', enabled: canReadActions },
    { name: 'Permisos', enabled: canReadPermissions },
  ];

  const activeIntegrations = integrations.filter((i) => i.enabled);
  const pendingIntegrations = integrations.filter((i) => !i.enabled);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumen"
        title={`Hola${profile ? `, ${profile.name}` : ''}`}
        description="Monitorea el estado general del panel administrativo y entra directo a cada CRUD."
        actions={
          hasAnyPermission(userPermissions, 'users', ['read']) ? (
            <Button component={Link} to="/users" variant="contained">
              Gestionar usuarios
            </Button>
          ) : undefined
        }
      />

      {profileQuery.error ? (
        <Alert severity="warning">
          {getApolloErrorMessage(profileQuery.error)}
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="block">
            <StateCard
              title={String(card.count)}
              description={card.label}
              icon={card.icon}
              loading={
                usersQuery.loading ||
                rolesQuery.loading ||
                modulesQuery.loading ||
                actionsQuery.loading ||
                permissionsQuery.loading
              }
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          title="Siguientes tareas"
          description="Atajos sugeridos para continuar la configuracion del panel."
        >
          <div className="grid gap-3">
            {hasAnyPermission(userPermissions, 'roles', ['read']) && (
              <Link
                className="rounded-2xl border border-border px-4 py-4 hover:border-accent"
                to="/roles"
              >
                Define roles base y asigna permisos a cada rol.
              </Link>
            )}
            {hasAnyPermission(userPermissions, 'permissions', ['read']) && (
              <Link
                className="rounded-2xl border border-border px-4 py-4 hover:border-accent"
                to="/permissions"
              >
                Crea permisos a partir de combinaciones modulo + accion.
              </Link>
            )}
            {hasAnyPermission(userPermissions, 'users', ['read']) && (
              <Link
                className="rounded-2xl border border-border px-4 py-4 hover:border-accent"
                to="/users"
              >
                Revisa usuarios existentes y ajusta sus roles.
              </Link>
            )}
            {cards.length === 0 && (
              <p className="text-sm text-text-secondary">
                No tienes acceso a ningún módulo. Contacta a un administrador.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Estado de integracion"
          description="Visibilidad sobre la disponibilidad actual del backend."
        >
          {userPermissions.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No tienes acceso a ningún módulo. Contacta a un administrador.
            </p>
          ) : (
            <div className="space-y-3 text-sm text-text-secondary">
              <ul className="space-y-2">
                {activeIntegrations.map((integration) => (
                  <li
                    key={integration.name}
                    className="flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {integration.name} conectado a GraphQL
                  </li>
                ))}
                {pendingIntegrations.length > 0 && (
                  <>
                    <li className="mt-3 border-t border-border pt-3 text-text-muted">
                      Permisos faltantes:
                    </li>
                    {pendingIntegrations.map((integration) => (
                      <li
                        key={integration.name}
                        className="flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {integration.name} sin acceso
                      </li>
                    ))}
                  </>
                )}
              </ul>
              {pendingIntegrations.length > 0 && (
                <p className="text-xs text-text-muted">
                  Contacta a un administrador para solicitar acceso a estos
                  módulos.
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
