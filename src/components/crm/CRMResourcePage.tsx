import * as React from 'react';
import AddRounded from '@mui/icons-material/AddRounded';
import AutorenewRounded from '@mui/icons-material/AutorenewRounded';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import AutoGraphRounded from '@mui/icons-material/AutoGraphRounded';
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlined from '@mui/icons-material/EditOutlined';
import TableViewRounded from '@mui/icons-material/TableViewRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type TableColumn } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrganizationSelector } from '@/components/crm/OrganizationSelector';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { getApolloErrorMessage } from '@/lib/graphql';
import { formatDate } from '@/lib/date-format';
import { MetricCard } from '@/components/ui/MetricCard';
import { CRMResourceFormFields } from './CRMResourceFormFields';
import { useCRMResourcePage } from './hooks/useCRMResourcePage';
import type { CRMModule, CRMResource } from '@/types/crm';

interface CRMResourcePageProps {
  module: CRMModule;
  title: string;
  description: string;
}

export const CRMResourcePage: React.FC<CRMResourcePageProps> = ({
  module,
  title,
  description,
}) => {
  const {
    organizationId,
    setOrganizationId,
    listState,
    resources,
    label,
    followUpCount,
    latestCreatedAt,
    dialogOpen,
    closeDialog,
    editing,
    confirmResource,
    lifecycleResource,
    form,
    setField,
    createState,
    updateState,
    deleteState,
    convertState,
    closeState,
    valid,
    openCreate,
    openEdit,
    openDeleteDialog,
    openLifecycle,
    closeLifecycle,
    closeDeleteDialog,
    handleSave,
    handleLifecycle,
    handleDelete,
  } = useCRMResourcePage(module, title);

  const columns: TableColumn<CRMResource>[] = [
    {
      key: 'name',
      header: module === 'activities' ? 'Asunto' : 'Nombre',
      render: (item) => item.name || item.subject || 'Sin nombre',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => item.stage || item.status || '—',
    },
    {
      key: 'owner',
      header: 'Propietario',
      render: (item) => item.ownerId || 'Sin asignar',
      hideOnMobile: true,
    },
    {
      key: 'created',
      header: 'Creado',
      render: (item) => formatDate(item.createdAt),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <div className="flex flex-wrap justify-end gap-2">
          {module === 'leads' && !item.convertedAt ? (
            <PermissionAction
              permission="leads.convert"
              startIcon={<AutorenewRounded />}
              onClick={() => openLifecycle(item, {
                  opportunityName: `${item.name} · Oportunidad`,
                  value: '0',
                  probability: '0',
                })}
            >
              Convertir
            </PermissionAction>
          ) : null}
          {module === 'opportunities' && !item.closedAt ? (
            <PermissionAction
              permission="opportunities.close"
              startIcon={<CheckCircleOutlineRounded />}
              onClick={() => openLifecycle(item)}
            >
              Cerrar
            </PermissionAction>
          ) : null}
          <PermissionAction
            permission={`${module}.update`}
            startIcon={<EditOutlined />}
            onClick={() => openEdit(item)}
          >
            Editar
          </PermissionAction>
          <PermissionAction
            permission={`${module}.delete`}
            startIcon={<DeleteOutlineRounded />}
            onClick={() => openDeleteDialog(item)}
          >
            Eliminar
          </PermissionAction>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="CRM"
        title={title}
        description={description}
        actions={
          <>
            <OrganizationSelector
              value={organizationId}
              onChange={setOrganizationId}
            />
            {organizationId ? (
              <PermissionAction
                permission={`${module}.create`}
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openCreate}
              >
                Nuevo
              </PermissionAction>
            ) : null}
          </>
        }
      />
      {!organizationId ? (
        <Alert severity="info">
          Selecciona una organización CRM para consultar información.
        </Alert>
      ) : null}
      {listState.error ? (
        <Alert severity="error">{getApolloErrorMessage(listState.error)}</Alert>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-3" aria-label={`Indicadores de ${title}`}>
        <MetricCard label="Registros" value={resources.length} detail="En esta organización" icon={<TableViewRounded />} />
        <MetricCard label="En seguimiento" value={followUpCount} detail="Requieren una próxima acción" icon={<AutoGraphRounded />} tone="blue" />
        <MetricCard label="Último registro" value={latestCreatedAt ? formatDate(latestCreatedAt) : '—'} detail="Fecha de alta más reciente" icon={<AccessTimeRounded />} tone="amber" />
      </section>
      <DataTable
        columns={columns}
        rows={resources}
        getRowKey={(item) => item.id}
        searchable
        searchPlaceholder={`Buscar ${title.toLowerCase()}...`}
        searchableFields={[
          (item) =>
            `${item.name ?? ''} ${item.subject ?? ''} ${item.email ?? ''}`,
        ]}
        emptyMessage={`Sin ${title.toLowerCase()}`}
      />
      <FormDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={`${editing ? 'Editar' : 'Nuevo'} ${label}`}
        subtitle="Los permisos y el alcance se validan nuevamente en el backend."
        actions={
          <>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!valid || createState.loading || updateState.loading}
              onClick={() => void handleSave()}
            >
              {editing ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }
      >
        <CRMResourceFormFields
          module={module}
          form={form}
          setField={setField}
        />
      </FormDialog>
      <FormDialog
        open={Boolean(lifecycleResource)}
        onClose={closeLifecycle}
        title={module === 'leads' ? 'Convertir lead' : 'Cerrar oportunidad'}
        subtitle={
          module === 'leads'
            ? 'Se creará una oportunidad enlazada al lead.'
            : 'Selecciona el resultado comercial.'
        }
        actions={
          module === 'leads' ? (
            <>
              <Button onClick={closeLifecycle}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                disabled={!form.opportunityName?.trim() || convertState.loading}
                onClick={() => void handleLifecycle()}
              >
                Convertir
              </Button>
            </>
          ) : (
            <>
              <Button onClick={closeLifecycle}>
                Cancelar
              </Button>
              <Button
                color="error"
                variant="outlined"
                disabled={closeState.loading}
                onClick={() => void handleLifecycle('lost')}
              >
                Perdida
              </Button>
              <Button
                color="success"
                variant="contained"
                disabled={closeState.loading}
                onClick={() => void handleLifecycle('won')}
              >
                Ganada
              </Button>
            </>
          )
        }
      >
        {module === 'leads' ? (
          <>
            <TextField
              autoFocus
              label="Nombre de oportunidad"
              value={form.opportunityName ?? ''}
              onChange={(event) =>
                setField('opportunityName', event.target.value)
              }
            />
            <TextField
              label="Valor"
              type="number"
              value={form.value ?? '0'}
              onChange={(event) => setField('value', event.target.value)}
            />
            <TextField
              label="Probabilidad"
              type="number"
              value={form.probability ?? '0'}
              onChange={(event) => setField('probability', event.target.value)}
            />
          </>
        ) : (
          <Alert severity="info">
            La oportunidad se marcará como ganada o perdida y registrará su
            fecha de cierre.
          </Alert>
        )}
      </FormDialog>
      <ConfirmDialog
        open={Boolean(confirmResource)}
        title={`Eliminar ${label}`}
        description="Esta acción no se puede deshacer."
        onClose={closeDeleteDialog}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
};
