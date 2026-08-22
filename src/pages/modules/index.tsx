import * as React from 'react';
import { Alert, Button } from '@mui/material';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { getApolloErrorMessage } from '@/lib/graphql';
import ModuleDetailPanel from './components/ModuleDetailPanel';
import ModuleFormFields from './components/ModuleFormFields';
import { useModulesPage } from './hooks/useModulesPage';

const ModulesPageContent: React.FC = () => {
  const {
    modulesQuery, modules, selectedId, setSelectedId, dialogMode,
    dialogOpen, setDialogOpen, formState, setFormState, selectedModule,
    openCreate, openEdit, handleSave, createState, updateState,
  } = useModulesPage();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Modulos"
        title="Catálogo de módulos"
        description="Administra los modulos funcionales usados para construir permisos."
        actions={
          <Button variant="contained" onClick={openCreate}>
            Nuevo módulo
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
                  header: 'Módulo',
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
              description="Crea el primer módulo para modelar permisos."
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
        title={dialogMode === 'create' ? 'Crear módulo' : 'Editar módulo'}
        subtitle="Define el nombre interno del módulo y su clave técnica."
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
};

export default ModulesPageContent;
