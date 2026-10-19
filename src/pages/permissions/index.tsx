import * as React from 'react';
import LayersRounded from '@mui/icons-material/LayersRounded';
import KeyRounded from '@mui/icons-material/KeyRounded';
import PlayCircleOutlineRounded from '@mui/icons-material/PlayCircleOutlineRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormDialog } from '@/components/ui/FormDialog';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StateCard } from '@/components/ui/StateCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import PermissionCard from './components/PermissionCard';
import { usePermissionsPage } from './hooks/usePermissionsPage';

const PermissionsPageContent: React.FC = () => {
  const {
    permissionsQuery,
    permissions,
    modules,
    actions,
    query,
    setQuery,
    moduleFilter,
    handleModuleFilterChange,
    dialogOpen,
    openCreate,
    closeCreate,
    deleteTarget,
    setDeleteTarget,
    formState,
    setFormState,
    filteredPermissions,
    groupedPermissions,
    moduleCount,
    actionCount,
    queryError,
    handleCreate,
    handleDelete,
    createState,
    deleteState,
    permissionsScrollRef,
  } = usePermissionsPage();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Permisos"
        title="Catálogo de permisos"
        description="Crea permisos a partir de módulo + acción y elimínalos cuando ya no apliquen."
        actions={
          <Button variant="contained" onClick={openCreate}>
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
          <StateCard
            title="Cargando catálogo de permisos..."
            description="Espera mientras cargamos los permisos disponibles."
            loading
          />
        ) : null}

        {!permissionsQuery.loading && !permissions.length ? (
          <div className="p-5">
            <StateCard
              title="Aún no hay permisos"
              description="Crea la primera regla para después asignarla a un rol."
              actionLabel="Crear permiso"
              onAction={openCreate}
              icon={<KeyRounded fontSize="small" />}
            />
          </div>
        ) : null}

        {permissions.length > 0 && !filteredPermissions.length ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-text">No encontramos permisos con esos filtros</p>
            <p className="mt-1 text-sm text-text-muted">Limpia la búsqueda o cambia el módulo seleccionado.</p>
            <Button className="mt-4" size="small" onClick={() => { setQuery(''); handleModuleFilterChange('all'); }}>Limpiar filtros</Button>
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
        onClose={closeCreate}
        title="Crear permiso"
        subtitle="Combina un módulo y una acción para definir un permiso asignable."
        actions={
          <>
            <Button onClick={closeCreate}>Cancelar</Button>
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
            setFormState((current) => ({ ...current, moduleId: event.target.value }))
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
            setFormState((current) => ({ ...current, actionId: event.target.value }))
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
            setFormState((current) => ({ ...current, description: event.target.value }))
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
        description={`Se eliminará el permiso ${deleteTarget?.moduleKey || ''}:${deleteTarget?.actionKey || ''}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
};

export default PermissionsPageContent;
