import * as React from 'react';
import LayersRounded from '@mui/icons-material/LayersRounded';
import KeyRounded from '@mui/icons-material/KeyRounded';
import PlayCircleOutlineRounded from '@mui/icons-material/PlayCircleOutlineRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormDialog } from '@/components/ui/FormDialog';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StateCard } from '@/components/ui/StateCard';
import { useActions } from '@/hooks/action.hook';
import { useModules } from '@/hooks/module.hook';
import {
  usePermissionMutations,
  usePermissions,
} from '@/hooks/permission.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CreatePermissionInput, Permission } from '@/types/admin';
import PermissionCard from './components/PermissionCard';

const emptyPermission: CreatePermissionInput = {
  moduleId: '',
  actionId: '',
  description: '',
};

const PermissionsPageContent: React.FC = () => {
  const permissionsQuery = usePermissions();
  const modulesQuery = useModules();
  const actionsQuery = useActions();
  const { createPermission, deletePermission, createState, deleteState } =
    usePermissionMutations();
  const permissions = React.useMemo(
    () => permissionsQuery.data?.permissions?.data ?? [],
    [permissionsQuery.data],
  );
  const modules = modulesQuery.data?.modules?.data ?? [];
  const actions = actionsQuery.data?.actions?.data ?? [];
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [formState, setFormState] =
    useState<CreatePermissionInput>(emptyPermission);
  const permissionsScrollRef = React.useRef<HTMLDivElement>(null);
  const filteredPermissions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return permissions.filter((permission) => {
      const matchesModule = moduleFilter === 'all' || permission.moduleKey === moduleFilter;
      const searchableText = `${permission.moduleKey} ${permission.actionKey} ${permission.description ?? ''}`.toLowerCase();
      return matchesModule && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [moduleFilter, permissions, query]);
  const groupedPermissions = React.useMemo(() => filteredPermissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    (groups[permission.moduleKey] ??= []).push(permission);
    return groups;
  }, {}), [filteredPermissions]);
  const moduleCount = new Set(permissions.map((permission) => permission.moduleKey)).size;
  const actionCount = new Set(permissions.map((permission) => permission.actionKey)).size;
  const queryError = permissionsQuery.error || modulesQuery.error || actionsQuery.error;
  const handleModuleFilterChange = (moduleKey: string) => {
    setModuleFilter(moduleKey);
    permissionsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = async () => {
    try {
      const response = await createPermission(formState);
      toast.success(response.message || 'Permiso creado.');
      setDialogOpen(false);
      setFormState(emptyPermission);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deletePermission(deleteTarget.id);
      toast.success('Permiso eliminado.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Permisos"
        title="Catálogo de permisos"
        description="Crea permisos a partir de módulo + acción y elimínalos cuando ya no apliquen."
        actions={
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Nuevo permiso
          </Button>
        }
      />

      {queryError ? (
        <Alert severity="error">{getApolloErrorMessage(queryError)}</Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen del catálogo de permisos">
        <MetricCard label="Permisos totales" value={permissions.length} detail="Reglas disponibles para asignar" icon={<KeyRounded />} />
        <MetricCard label="Módulos" value={moduleCount} detail="Áreas protegidas" icon={<LayersRounded />} tone="blue" />
        <MetricCard label="Acciones" value={actionCount} detail="Operaciones reutilizables" icon={<PlayCircleOutlineRounded />} tone="green" />
        <MetricCard label="Vista actual" value={filteredPermissions.length} detail="Resultados con estos filtros" icon={<KeyRounded />} tone="amber" />
      </section>

      <section className="workspace-card overflow-hidden">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-text">Explorar permisos</h2>
                <span className="rounded-lg bg-accent-soft px-2 py-1 text-[11px] font-bold text-accent">{filteredPermissions.length}</span>
              </div>
              <p className="mt-1 text-sm text-text-secondary">Busca por módulo, acción o descripción para encontrar una regla rápidamente.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <TextField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                size="small"
                placeholder="Buscar permiso..."
                slotProps={{
                  input: {
                    startAdornment: <SearchRounded className="mr-2 text-text-muted" fontSize="small" />,
                  },
                }}
                sx={{ minWidth: { sm: 260 } }}
              />
              <TextField
                select
                size="small"
                label="Módulo"
                value={moduleFilter}
                onChange={(event) => handleModuleFilterChange(event.target.value)}
                sx={{ minWidth: { sm: 190 } }}
              >
                <MenuItem value="all">Todos los módulos</MenuItem>
                {Array.from(new Set(permissions.map((permission) => permission.moduleKey))).sort().map((moduleKey) => (
                  <MenuItem key={moduleKey} value={moduleKey}>{moduleKey}</MenuItem>
                ))}
              </TextField>
            </div>
          </div>
        </div>

        {permissionsQuery.loading && !permissions.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <CircularProgress size={28} sx={{ color: 'var(--accent)' }} />
            <p className="text-sm text-text-secondary">Cargando catálogo de permisos...</p>
          </div>
        ) : null}

        {!permissionsQuery.loading && !permissions.length ? (
          <div className="p-5">
            <StateCard
              title="Aún no hay permisos"
              description="Crea la primera regla para después asignarla a un rol."
              actionLabel="Crear permiso"
              onAction={() => setDialogOpen(true)}
              icon={<KeyRounded fontSize="small" />}
            />
          </div>
        ) : null}

        {permissions.length > 0 && !filteredPermissions.length ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-text">No encontramos permisos con esos filtros</p>
            <p className="mt-1 text-sm text-text-muted">Limpia la búsqueda o cambia el módulo seleccionado.</p>
            <Button className="mt-4" size="small" onClick={() => { setQuery(''); setModuleFilter('all'); }}>Limpiar filtros</Button>
          </div>
        ) : null}

        {filteredPermissions.length > 0 ? (
          <div ref={permissionsScrollRef} className="permission-catalog-scroll space-y-7 overflow-y-auto">
            {Object.entries(groupedPermissions).sort(([first], [second]) => first.localeCompare(second)).map(([moduleKey, modulePermissions]) => (
              <section className="px-4 pb-5 sm:px-5" key={moduleKey}>
                <div className="sticky top-0 z-10 -mx-4 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-surface-card px-4 py-3 shadow-[0_5px_12px_-10px_rgba(24,44,65,0.28)] dark:shadow-[0_5px_12px_-10px_rgba(0,0,0,0.28)] sm:-mx-5 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-text-secondary">{moduleKey}</h3>
                  </div>
                  <span className="text-xs text-text-muted">{modulePermissions.length} {modulePermissions.length === 1 ? 'permiso' : 'permisos'}</span>
                </div>
                <div className="grid gap-3 pt-3 md:grid-cols-2 2xl:grid-cols-3">
                  {modulePermissions.map((permission) => (
                    <PermissionCard key={permission.id} permission={permission} onDelete={setDeleteTarget} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </section>

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Crear permiso"
        subtitle="Combina un módulo y una acción para definir un permiso asignable."
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleCreate()}
              variant="contained"
              disabled={createState.loading || !formState.moduleId || !formState.actionId}
            >
              Guardar
            </Button>
          </>
        }
      >
        <TextField
          label="Módulo"
          select
          value={formState.moduleId}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              moduleId: event.target.value,
            }))
          }
          size="small"
          fullWidth
        >
          {modules.map((module) => (
            <MenuItem key={module.id} value={module.key}>
              {module.name} ({module.key})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Acción"
          select
          value={formState.actionId}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              actionId: event.target.value,
            }))
          }
          size="small"
          fullWidth
        >
          {actions.map((action) => (
            <MenuItem key={action.id} value={action.key}>
              {action.name} ({action.key})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Descripción"
          value={formState.description ?? ''}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          multiline
          minRows={3}
          size="small"
          fullWidth
        />
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar permiso"
        description={`Se eliminara el permiso ${deleteTarget?.moduleKey || ''}:${deleteTarget?.actionKey || ''}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
};

export default PermissionsPageContent;
