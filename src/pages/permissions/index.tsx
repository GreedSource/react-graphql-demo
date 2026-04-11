import { useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  TextField,
} from '@mui/material';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { useActions } from '@/hooks/action.hook';
import { useModules } from '@/hooks/module.hook';
import { usePermissionMutations, usePermissions } from '@/hooks/permission.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CreatePermissionInput, Permission } from '@/types/admin';

const emptyPermission: CreatePermissionInput = {
  moduleId: '',
  actionId: '',
  description: '',
};

export default function PermissionsPage() {
  const permissionsQuery = usePermissions();
  const modulesQuery = useModules();
  const actionsQuery = useActions();
  const { createPermission, deletePermission, createState, deleteState } =
    usePermissionMutations();
  const permissions = permissionsQuery.data?.permissions?.data ?? [];
  const modules = modulesQuery.data?.modules?.data ?? [];
  const actions = actionsQuery.data?.actions?.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [formState, setFormState] = useState<CreatePermissionInput>(emptyPermission);

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
        title="Catalogo de permisos"
        description="Crea permisos a partir de modulo + accion y eliminalos cuando ya no apliquen."
        actions={<Button variant="contained" onClick={() => setDialogOpen(true)}>Nuevo permiso</Button>}
      />

      {permissionsQuery.error ? (
        <Alert severity="error">{getApolloErrorMessage(permissionsQuery.error)}</Alert>
      ) : null}

      <SectionCard title="Listado de permisos">
        {permissions.length ? (
          <DataTable
            rows={permissions}
            getRowKey={(item) => item.id}
            columns={[
              { key: 'module', header: 'Modulo', render: (item) => item.moduleId },
              { key: 'action', header: 'Accion', render: (item) => item.actionId },
              { key: 'description', header: 'Descripcion', render: (item) => item.description || 'Sin descripcion' },
              {
                key: 'actions',
                header: 'Acciones',
                render: (item) => (
                  <Button color="error" size="small" onClick={() => setDeleteTarget(item)}>
                    Eliminar
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <StateCard title="Sin permisos" description="Primero crea permisos para luego asignarlos a roles." />
        )}
      </SectionCard>

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Crear permiso"
        subtitle="Combina un modulo y una accion para definir un permiso asignable."
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleCreate()}
              variant="contained"
              disabled={createState.loading}
            >
              Guardar
            </Button>
          </>
        }
      >
          <TextField
            label="Modulo"
            select
            value={formState.moduleId}
            onChange={(event) => setFormState((current) => ({ ...current, moduleId: event.target.value }))}
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
            label="Accion"
            select
            value={formState.actionId}
            onChange={(event) => setFormState((current) => ({ ...current, actionId: event.target.value }))}
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
            label="Descripcion"
            value={formState.description ?? ''}
            onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            multiline
            minRows={3}
            size="small"
            fullWidth
          />
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar permiso"
        description={`Se eliminara el permiso ${deleteTarget?.moduleId || ''}:${deleteTarget?.actionId || ''}.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
}
