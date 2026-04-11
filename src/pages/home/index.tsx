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
  const usersQuery = useUsers();
  const rolesQuery = useRoles();
  const modulesQuery = useModules();
  const actionsQuery = useActions();
  const permissionsQuery = usePermissions();
  const { user } = usePermission();

  const profile = profileQuery.data?.profile?.data;
  
  const userPermissions = user?.role?.permissions ?? [];
  
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
  ].filter((card) => hasAnyPermission(userPermissions, card.permissionType, card.permissionActions));

  const hasError =
    usersQuery.error ||
    rolesQuery.error ||
    modulesQuery.error ||
    actionsQuery.error ||
    permissionsQuery.error;

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
        <Alert severity="warning">{getApolloErrorMessage(profileQuery.error)}</Alert>
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
              <Link className="rounded-2xl border border-slate-200 px-4 py-4 hover:border-sky-400" to="/roles">
                Define roles base y asigna permisos a cada rol.
              </Link>
            )}
            {hasAnyPermission(userPermissions, 'permissions', ['read']) && (
              <Link className="rounded-2xl border border-slate-200 px-4 py-4 hover:border-sky-400" to="/permissions">
                Crea permisos a partir de combinaciones modulo + accion.
              </Link>
            )}
            {hasAnyPermission(userPermissions, 'users', ['read']) && (
              <Link className="rounded-2xl border border-slate-200 px-4 py-4 hover:border-sky-400" to="/users">
                Revisa usuarios existentes y ajusta sus roles.
              </Link>
            )}
            {cards.length === 0 && (
              <p className="text-sm text-slate-600">No tienes acceso a ningún módulo. Contacta a un administrador.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Estado de integracion"
          description="Visibilidad sobre la disponibilidad actual del backend."
        >
          {hasError ? (
            <Alert severity="error">{getApolloErrorMessage(hasError)}</Alert>
          ) : (
            <div className="space-y-3 text-sm text-slate-600">
              <p>Auth, usuarios, roles, modulos, acciones y permisos ya tienen flujo de consumo desde GraphQL.</p>
              <p>La UI queda preparada para extender `deleteModule`, `updateAction` y `updatePermission` cuando el backend los publique.</p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
