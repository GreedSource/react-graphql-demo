import { Alert, Button, Chip } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAuthActions, useProfileQuery } from '@/hooks/auth.hook';
import {
  formatRolePermissionLabel,
  getApolloErrorMessage,
} from '@/lib/graphql';

export default function ProfilePage() {
  const { performLogout } = useAuthActions();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data?.profile?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Perfil"
        title="Tu sesion actual"
        description="Consulta tu informacion autenticada y el alcance de permisos que regresa la API."
        actions={
          <Button
            color="error"
            variant="outlined"
            onClick={() => void performLogout()}
          >
            Cerrar sesion
          </Button>
        }
      />

      {profileQuery.error ? (
        <Alert severity="error">
          {getApolloErrorMessage(profileQuery.error)}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Datos del usuario">
          {profile ? (
            <dl className="grid gap-4 text-sm text-text-secondary">
              <div>
                <dt className="font-semibold text-text">Nombre</dt>
                <dd>
                  {profile.name} {profile.lastname}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-text">Correo</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-text">Rol</dt>
                <dd>{profile.role?.name || 'Sin rol asignado'}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-text-muted">
              No hay informacion de perfil disponible.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="Permisos heredados del rol"
          description="Los permisos se muestran como `modulo:accion` segun la respuesta del backend."
        >
          {profile?.role?.permissions?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.role.permissions.map((permission) => (
                <Chip
                  key={formatRolePermissionLabel(
                    permission.type,
                    permission.action,
                  )}
                  label={formatRolePermissionLabel(
                    permission.type,
                    permission.action,
                  )}
                  color="info"
                  variant="outlined"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Este usuario aun no recibe permisos desde su rol.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
