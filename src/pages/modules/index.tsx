import { useEffect, useMemo, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { useModule, useModuleMutations, useModules } from '@/hooks/module.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CreateModuleInput, UpdateModuleInput } from '@/types/admin';
import ModuleDetailPanel from './module-detail-panel';
import ModuleFormFields from './module-form-fields';

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
        <SectionCard title="Listado de modulos" badge={modules.length}>
          {modules.length ? (
            <DataTable
              rows={modules}
              getRowKey={(item) => item.id}
              selectedRowKey={selectedId}
              onRowClick={(item) => setSelectedId(item.id)}
              searchable
              searchPlaceholder="Buscar por nombre o clave..."
              searchableFields={[(item) => item.name, (item) => item.key]}
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
          <ModuleDetailPanel
            selectedModule={selectedModule}
            onEdit={openEdit}
          />
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
        <ModuleFormFields
          formState={formState}
          dialogMode={dialogMode}
          onChange={setFormState}
        />
      </FormDialog>
    </div>
  );
}
