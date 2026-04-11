import { useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  TextField,
} from '@mui/material';
import { toast } from 'react-toastify';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { useActionMutations, useActions } from '@/hooks/action.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { slugifyKey } from '@/lib/validation';
import type { CreateActionInput } from '@/types/admin';

const emptyAction: CreateActionInput = {
  name: '',
  key: '',
  description: '',
  active: true,
};

export default function ActionsPage() {
  const actionsQuery = useActions();
  const { createAction, createState } = useActionMutations();
  const actions = actionsQuery.data?.actions?.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<CreateActionInput>(emptyAction);

  const handleSave = async () => {
    try {
      const response = await createAction(formState);
      toast.success(response.message || 'Accion creada.');
      setDialogOpen(false);
      setFormState(emptyAction);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Acciones"
        title="Catalogo de acciones"
        description="Administra acciones reutilizables para combinarlas despues en permisos."
        actions={<Button variant="contained" onClick={() => setDialogOpen(true)}>Nueva accion</Button>}
      />

      {actionsQuery.error ? (
        <Alert severity="error">{getApolloErrorMessage(actionsQuery.error)}</Alert>
      ) : null}

      <SectionCard title="Listado de acciones">
        {actions.length ? (
          <DataTable
            rows={actions}
            getRowKey={(item) => item.id}
            columns={[
              { key: 'name', header: 'Accion', render: (item) => item.name },
              { key: 'key', header: 'Key', render: (item) => item.key },
              { key: 'description', header: 'Descripcion', render: (item) => item.description || 'Sin descripcion' },
              { key: 'status', header: 'Estado', render: (item) => <StatusChip active={item.active} /> },
            ]}
          />
        ) : (
          <StateCard title="Sin acciones" description="Crea la primera accion del sistema." />
        )}
      </SectionCard>

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Crear accion"
        subtitle="Registra una accion reutilizable para el modelo de permisos."
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleSave()}
              variant="contained"
              disabled={createState.loading}
            >
              Guardar
            </Button>
          </>
        }
      >
          <TextField
            label="Nombre"
            value={formState.name}
            onChange={(event) => {
              const name = event.target.value;
              setFormState((current) => ({
                ...current,
                name,
                key: slugifyKey(name),
              }));
            }}
            size="small"
            fullWidth
          />
          <TextField
            label="Key"
            value={formState.key}
            onChange={(event) => setFormState((current) => ({ ...current, key: slugifyKey(event.target.value) }))}
            size="small"
            fullWidth
          />
          <TextField
            label="Descripcion"
            value={formState.description ?? ''}
            onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            multiline
            minRows={3}
            size="small"
            fullWidth
          />
          <TextField
            label="Estado"
            select
            value={String(formState.active ?? true)}
            onChange={(event) => setFormState((current) => ({ ...current, active: event.target.value === 'true' }))}
            size="small"
            fullWidth
          >
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </TextField>
      </FormDialog>
    </div>
  );
}
