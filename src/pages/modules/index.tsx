import * as React from 'react';
import EditRounded from '@mui/icons-material/EditRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { getApolloErrorMessage } from '@/lib/graphql';
import ModuleFormFields from './components/ModuleFormFields';
import { useModulesPage } from './hooks/useModulesPage';

const ModulesPageContent: React.FC = () => {
  const {
    modulesQuery, modules, dialogMode,
    dialogOpen, setDialogOpen, formState, setFormState,
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

      <SectionCard title="Módulos" badge={modules.length}>
        {modules.length ? (
          <DataTable
            rows={modules}
            getRowKey={(item) => item.id}
            searchable
            searchPlaceholder="Buscar por nombre, clave o descripción..."
            searchableFields={[
              (item) => item.name,
              (item) => item.key,
              (item) => item.description ?? '',
            ]}
            columns={[
              {
                key: 'name',
                header: 'Módulo',
                render: (item) => <span className="font-medium">{item.name}</span>,
              },
              {
                key: 'key',
                header: 'Clave',
                render: (item) => <span className="font-mono text-xs">{item.key}</span>,
              },
              {
                key: 'description',
                header: 'Descripción',
                hideOnMobile: true,
                render: (item) => item.description || 'Sin descripción',
              },
              {
                key: 'active',
                header: 'Estado',
                render: (item) => <StatusChip active={item.active} />,
              },
              {
                key: 'edit',
                header: '',
                align: 'right',
                render: (item) => (
                  <Tooltip title={`Editar ${item.name}`}>
                    <IconButton
                      size="small"
                      aria-label={`Editar módulo ${item.name}`}
                      onClick={() => openEdit(item)}
                    >
                      <EditRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              },
            ]}
          />
        ) : (
          <StateCard
            title="Sin módulos"
            description="Crea el primer módulo para modelar permisos."
          />
        )}
      </SectionCard>

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogMode === 'create' ? 'Crear módulo' : 'Editar módulo'}
        subtitle="Define el nombre y la clave del módulo; agrega una descripción si ayuda a identificarlo."
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
