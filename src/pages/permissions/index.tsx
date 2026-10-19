import * as React from 'react';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import { usePermissionsPage } from './hooks/usePermissionsPage';

const PermissionsPageContent: React.FC = () => {
  const {
    permissionsQuery,
    permissions,
    modules,
    actions,
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
    queryError,
    handleCreate,
    handleDelete,
    createState,
    deleteState,
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

      <SectionCard
        title="Permisos"
        description="Cada permiso combina un módulo con una acción."
        badge={permissions.length}
      >
        <div className="mb-4 flex justify-end">
          <TextField
            select
            size="small"
            label="Módulo"
            value={moduleFilter}
            onChange={(event) => handleModuleFilterChange(event.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
          >
            <MenuItem value="all">Todos los módulos</MenuItem>
            {Array.from(new Set(permissions.map(({ moduleKey }) => moduleKey)))
              .sort()
              .map((moduleKey) => (
                <MenuItem key={moduleKey} value={moduleKey}>
                  {moduleKey}
                </MenuItem>
              ))}
          </TextField>
        </div>

        {permissionsQuery.loading && !permissions.length ? (
          <StateCard
            title="Cargando permisos..."
            description="Espera mientras cargamos el catálogo."
            loading
          />
        ) : permissions.length ? (
          <DataTable
            rows={filteredPermissions}
            getRowKey={(permission) => permission.id}
            searchable
            searchPlaceholder="Buscar módulo, acción o descripción..."
            searchableFields={[
              (permission) => permission.moduleKey,
              (permission) => permission.actionKey,
              (permission) => permission.description ?? '',
            ]}
            emptyMessage="No hay permisos para este filtro"
            emptyDescription="Prueba otro módulo o cambia la búsqueda."
            columns={[
              {
                key: 'permission',
                header: 'Permiso',
                render: (permission) => (
                  <span className="font-mono text-sm font-medium text-text">
                    {permission.moduleKey}.{permission.actionKey}
                  </span>
                ),
              },
              {
                key: 'description',
                header: 'Descripción',
                hideOnMobile: true,
                render: (permission) =>
                  permission.description || 'Sin descripción',
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: (permission) => (
                  <Tooltip title="Eliminar permiso">
                    <IconButton
                      size="small"
                      aria-label={`Eliminar permiso ${permission.moduleKey}.${permission.actionKey}`}
                      onClick={() => setDeleteTarget(permission)}
                    >
                      <DeleteOutlineRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              },
            ]}
          />
        ) : (
          <StateCard
            title="Aún no hay permisos"
            description="Crea la primera combinación de módulo y acción."
            actionLabel="Crear permiso"
            onAction={openCreate}
          />
        )}
      </SectionCard>

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
        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>
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
        description={`Se eliminará el permiso ${deleteTarget?.moduleKey || ''}.${deleteTarget?.actionKey || ''}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
};

export default PermissionsPageContent;
