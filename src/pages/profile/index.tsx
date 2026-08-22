import * as React from 'react';
import { Alert, Avatar, Button, Chip, Collapse } from '@mui/material';
import { CheckRounded, ExpandMoreRounded, ShieldRounded } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAuthActions, useProfileQuery } from '@/hooks/auth.hook';
import { getApolloErrorMessage } from '@/lib/graphql';

const ProfilePageContent: React.FC = () => {
  const { performLogout } = useAuthActions();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data?.profile?.data;
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const permissionGroups = useMemo(() => {
    const permissions = profile?.role?.permissions ?? [];
    return permissions.reduce<Record<string, string[]>>((groups, permission) => {
      const key = permission.type || 'general';
      groups[key] = [...(groups[key] ?? []), permission.action];
      return groups;
    }, {});
  }, [profile]);
  const groupEntries = Object.entries(permissionGroups);
  const enabledPermissionCount = groupEntries.reduce((total, [, actions]) => total + actions.length, 0);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Perfil"
        title="Tu espacio de trabajo"
        description="Administra tu identidad y revisa, de un vistazo, las capacidades heredadas de tu rol."
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

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
        <SectionCard title="Datos del usuario" icon={<Avatar sx={{ width: 36, height: 36, bgcolor: 'transparent', color: 'inherit', fontSize: 14 }}>{profile?.name?.[0]}</Avatar>}>
          {profile ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl bg-accent-soft/60 p-3">
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'var(--accent)', color: '#fff', fontWeight: 700 }}>{profile.name?.[0]}{profile.lastname?.[0]}</Avatar>
                <div className="min-w-0"><p className="truncate font-semibold text-text">{profile.name} {profile.lastname}</p><p className="truncate text-xs text-text-secondary">{profile.email}</p></div>
              </div>
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
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              No hay informacion de perfil disponible.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="Permisos del rol"
          description="Agrupados por módulo para que encuentres el alcance de tu rol sin recorrer una pared de chips."
          icon={<ShieldRounded fontSize="small" />}
          badge={enabledPermissionCount}
        >
          {groupEntries.length ? (
            <div className="max-h-[min(560px,calc(100vh-360px))] space-y-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:var(--accent-soft)_transparent]">
              {groupEntries.map(([module, actions], index) => {
                const isOpen = openModules[module] ?? index < 2;
                return <div key={module} className="overflow-hidden rounded-xl border border-border/70 bg-surface-elevated/45 transition-all duration-300 hover:border-accent/40 hover:shadow-sm">
                  <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpenModules((current) => ({ ...current, [module]: !isOpen }))} aria-expanded={isOpen}>
                    <span className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold uppercase text-accent">{module.slice(0, 2)}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold capitalize text-text">{module.replace(/[-_]/g, ' ')}</span><span className="block text-xs text-text-muted">{actions.length} {actions.length === 1 ? 'permiso' : 'permisos'}</span></span></span>
                    <ExpandMoreRounded className={`shrink-0 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fontSize="small" />
                  </button>
                  <Collapse in={isOpen} timeout={280} unmountOnExit>
                    <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 pb-4 pt-3">{actions.map((action) => <Chip key={`${module}-${action}`} icon={<CheckRounded sx={{ fontSize: 15 }} />} label={action.replace(/[-_]/g, ' ')} size="small" sx={{ borderRadius: '8px', bgcolor: 'var(--accent-soft)', color: 'var(--text-primary)', border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)', textTransform: 'capitalize', '& .MuiChip-icon': { color: 'var(--accent)' } }} />)}</div>
                  </Collapse>
                </div>;
              })}
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
};

export default ProfilePageContent;
