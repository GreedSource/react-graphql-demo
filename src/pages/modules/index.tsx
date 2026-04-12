import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { useModule, useModuleMutations, useModules } from '@/hooks/module.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { slugifyKey } from '@/lib/validation';
import type { CreateModuleInput, UpdateModuleInput } from '@/types/admin';

const emptyModule: CreateModuleInput = {
  name: '',
  key: '',
  description: '',
  active: true,
};

export default function ModulesPage() {
  const modulesQuery = useModules();
  const { createModule, updateModule, createState, updateState } =
    useModuleMutations();
  const modules = useMemo(
    () => modulesQuery.data?.modules?.data ?? [],
    [modulesQuery.data],
  );
  const [selectedId, setSelectedId] = useState('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<
    CreateModuleInput & { id?: string }
  >(emptyModule);
  const moduleDetailQuery = useModule(selectedId);

  useEffect(() => {
    if (!selectedId && modules.length > 0) setSelectedId(modules[0].id);
  }, [modules, selectedId]);

  const selectedModule = useMemo(() => {
    return (
      moduleDetailQuery.data?.module?.data ??
      modules.find((module) => module.id === selectedId)
    );
  }, [moduleDetailQuery.data?.module?.data, modules, selectedId]);

  const openCreate = () => {
    setDialogMode('create');
    setFormState(emptyModule);
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (!selectedModule) return;
    setDialogMode('edit');
    setFormState({
      id: selectedModule.id,
      name: selectedModule.name,
      key: selectedModule.key,
      description: selectedModule.description || '',
      active: selectedModule.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        const response = await createModule(formState);
        toast.success(response.message || 'Modulo creado.');
      } else {
        const response = await updateModule(formState as UpdateModuleInput);
        toast.success(response.message || 'Modulo actualizado.');
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Modulos"
        title="Catalogo de modulos"
        description="Administra los modulos funcionales usados para construir permisos."
        actions={
          <Button variant="contained" onClick={openCreate}>
            Nuevo modulo
          </Button>
        }
      />

      {modulesQuery.error ? (
        <Alert severity="error">
          {getApolloErrorMessage(modulesQuery.error)}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Listado de modulos">
          {modules.length ? (
            <DataTable
              rows={modules}
              getRowKey={(item) => item.id}
              selectedRowKey={selectedId}
              onRowClick={(item) => setSelectedId(item.id)}
              columns={[
                {
                  key: 'name',
                  header: 'Modulo',
                  render: (item) => (
                    <span className="font-medium">{item.name}</span>
                  ),
                },
                {
                  key: 'key',
                  header: 'Key',
                  render: (item) => item.key,
                },
                {
                  key: 'active',
                  header: 'Estado',
                  render: (item) => <StatusChip active={item.active} />,
                },
              ]}
            />
          ) : (
            <StateCard
              title="Sin modulos"
              description="Crea el primer modulo para modelar permisos."
            />
          )}
        </SectionCard>

        <SectionCard title="Detalle">
          {selectedModule ? (
            <div className="space-y-4 text-sm text-text-secondary">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-text">
                  {selectedModule.name}
                </h3>
                <StatusChip active={selectedModule.active} />
              </div>
              <p>
                <span className="font-semibold text-text">Key:</span>{' '}
                {selectedModule.key}
              </p>
              <p>
                {selectedModule.description ||
                  'Sin descripcion para este modulo.'}
              </p>
              <Button variant="contained" onClick={openEdit}>
                Editar modulo
              </Button>
            </div>
          ) : (
            <StateCard
              title="Sin seleccion"
              description="Selecciona un modulo de la tabla."
            />
          )}
        </SectionCard>
      </div>

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogMode === 'create' ? 'Crear modulo' : 'Editar modulo'}
        subtitle="Define el nombre interno del modulo y su clave tecnica."
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleSave()}
              variant="contained"
              disabled={createState.loading || updateState.loading}
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
              key: dialogMode === 'create' ? slugifyKey(name) : current.key,
            }));
          }}
          size="small"
          fullWidth
        />
        <TextField
          label="Key"
          value={formState.key}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              key: slugifyKey(event.target.value),
            }))
          }
          size="small"
          fullWidth
        />
        <TextField
          label="Descripcion"
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
        <TextField
          label="Estado"
          select
          value={String(formState.active ?? true)}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              active: event.target.value === 'true',
            }))
          }
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
