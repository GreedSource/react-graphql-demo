import * as React from 'react';
import {
  AddRounded,
  AutorenewRounded,
  AccessTimeRounded,
  AutoGraphRounded,
  CheckCircleOutlineRounded,
  DeleteOutlineRounded,
  EditOutlined,
  TableViewRounded,
} from '@mui/icons-material';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type TableColumn } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrganizationSelector } from '@/components/crm/OrganizationSelector';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { useCrmOrganization, useCrmResources } from '@/hooks/crm.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { formatDate } from '@/lib/date-format';
import { MetricCard } from '@/components/ui/MetricCard';
import type { CRMModule, CRMResource, CRMResourceInput } from '@/types/crm';

interface CRMResourcePageProps {
  module: CRMModule;
  title: string;
  description: string;
}

const moduleLabels: Record<CRMModule, string> = {
  companies: 'empresa',
  contacts: 'contacto',
  leads: 'lead',
  opportunities: 'oportunidad',
  activities: 'actividad',
};

export const CRMResourcePage: React.FC<CRMResourcePageProps> = ({
  module,
  title,
  description,
}) => {
  const { organizationId, setOrganizationId } = useCrmOrganization();
  const {
    listState,
    createResource,
    updateResource,
    deleteResource,
    convertLead,
    closeOpportunity,
    createState,
    updateState,
    deleteState,
    convertState,
    closeState,
  } = useCrmResources(module, organizationId);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CRMResource | null>(null);
  const [confirmResource, setConfirmResource] =
    React.useState<CRMResource | null>(null);
  const [lifecycleResource, setLifecycleResource] =
    React.useState<CRMResource | null>(null);
  const [form, setForm] = React.useState<Record<string, string>>({});
  const resources = listState.data?.[module]?.data ?? [];
  const label = moduleLabels[module];
  const followUpCount = resources.filter((item) => {
    if (module === 'leads') return !item.convertedAt && item.status !== 'lost';
    if (module === 'opportunities') return !item.closedAt;
    if (module === 'activities') return item.status !== 'completed';
    return Boolean(item.ownerId);
  }).length;
  const latestCreatedAt = resources.reduce<string | null>((latest, item) => {
    if (!latest || new Date(item.createdAt).getTime() > new Date(latest).getTime()) return item.createdAt;
    return latest;
  }, null);
  const setField = (field: string, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setDialogOpen(true);
  };
  const openEdit = (resource: CRMResource) => {
    setEditing(resource);
    setForm(
      Object.fromEntries(
        Object.entries(resource)
          .filter(([, value]) => value !== null && value !== undefined)
          .map(([key, value]) => [key, String(value)]),
      ),
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!organizationId) return;
    const input: CRMResourceInput = { organizationId };
    if (module === 'activities') {
      input.activityType = form.activityType || 'note';
      input.subject = form.subject?.trim();
    } else {
      input.name = form.name?.trim();
    }
    if (module === 'contacts') input.lastname = form.lastname?.trim();
    if (module === 'companies') {
      input.industry = form.industry?.trim();
      input.website = form.website?.trim();
      input.address = form.address?.trim();
    }
    if (module === 'contacts') input.position = form.position?.trim();
    if (module !== 'activities') {
      input.email = form.email?.trim();
      input.phone = form.phone?.trim();
    }
    if (module === 'leads') {
      input.source = form.source?.trim();
      input.score = Number(form.score || 0);
      input.status = form.status || 'new';
    }
    if (module === 'opportunities') {
      input.value = form.value || '0';
      input.probability = Number(form.probability || 0);
      input.stage = form.stage || 'qualified';
      input.expectedCloseDate = form.expectedCloseDate || undefined;
    }
    if (module === 'activities') {
      input.description = form.description?.trim();
      input.status = form.status || undefined;
      input.scheduledAt = form.scheduledAt || undefined;
    }
    try {
      const updateInput: Partial<CRMResourceInput> = { ...input };
      delete updateInput.organizationId;
      const response = editing
        ? await updateResource({ id: editing.id, ...updateInput })
        : await createResource(input);
      toast.success(
        response.message || `${label} ${editing ? 'actualizado' : 'creado'}.`,
      );
      setForm({});
      setEditing(null);
      setDialogOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleLifecycle = async (stage?: string) => {
    if (!lifecycleResource) return;
    try {
      const response =
        module === 'leads'
          ? await convertLead({
              id: lifecycleResource.id,
              opportunityName:
                form.opportunityName ||
                `${lifecycleResource.name} · Oportunidad`,
              value: form.value || '0',
              probability: Number(form.probability || 0),
            })
          : await closeOpportunity({
              id: lifecycleResource.id,
              stage: stage || 'won',
            });
      toast.success(response.message || 'Estado comercial actualizado.');
      setLifecycleResource(null);
      setForm({});
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!confirmResource) return;
    try {
      const response = await deleteResource(confirmResource.id);
      toast.success(response.message || `${title} eliminado.`);
      setConfirmResource(null);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

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
              onClick={() => {
                setForm({
                  opportunityName: `${item.name} · Oportunidad`,
                  value: '0',
                  probability: '0',
                });
                setLifecycleResource(item);
              }}
            >
              Convertir
            </PermissionAction>
          ) : null}
          {module === 'opportunities' && !item.closedAt ? (
            <PermissionAction
              permission="opportunities.close"
              startIcon={<CheckCircleOutlineRounded />}
              onClick={() => setLifecycleResource(item)}
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
            onClick={() => setConfirmResource(item)}
          >
            Eliminar
          </PermissionAction>
        </div>
      ),
    },
  ];

  const valid = Boolean(
    organizationId &&
    (module === 'activities' ? form.subject?.trim() : form.name?.trim()) &&
    (module !== 'contacts' || form.lastname?.trim()),
  );

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
        onClose={() => setDialogOpen(false)}
        title={`${editing ? 'Editar' : 'Nuevo'} ${label}`}
        subtitle="Los permisos y el alcance se validan nuevamente en el backend."
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
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
        {module !== 'activities' ? (
          <TextField
            autoFocus
            label="Nombre"
            value={form.name ?? ''}
            onChange={(event) => setField('name', event.target.value)}
          />
        ) : null}
        {module === 'contacts' ? (
          <>
            <TextField
              label="Apellido"
              value={form.lastname ?? ''}
              onChange={(event) => setField('lastname', event.target.value)}
            />
            <TextField
              label="Cargo"
              value={form.position ?? ''}
              onChange={(event) => setField('position', event.target.value)}
            />
          </>
        ) : null}
        {module === 'companies' ? (
          <>
            <TextField
              label="Industria"
              value={form.industry ?? ''}
              onChange={(event) => setField('industry', event.target.value)}
            />
            <TextField
              label="Sitio web"
              value={form.website ?? ''}
              onChange={(event) => setField('website', event.target.value)}
            />
            <TextField
              label="Dirección"
              value={form.address ?? ''}
              onChange={(event) => setField('address', event.target.value)}
            />
          </>
        ) : null}
        {module !== 'activities' &&
        module !== 'leads' &&
        module !== 'opportunities' ? (
          <>
            <TextField
              label="Email"
              type="email"
              value={form.email ?? ''}
              onChange={(event) => setField('email', event.target.value)}
            />
            <TextField
              label="Teléfono"
              value={form.phone ?? ''}
              onChange={(event) => setField('phone', event.target.value)}
            />
          </>
        ) : null}
        {module === 'leads' ? (
          <>
            <TextField
              label="Origen"
              value={form.source ?? ''}
              onChange={(event) => setField('source', event.target.value)}
            />
            <TextField
              label="Score"
              type="number"
              value={form.score ?? '0'}
              onChange={(event) => setField('score', event.target.value)}
            />
            <TextField
              select
              label="Estado"
              value={form.status ?? 'new'}
              onChange={(event) => setField('status', event.target.value)}
            >
              <MenuItem value="new">Nuevo</MenuItem>
              <MenuItem value="contacted">Contactado</MenuItem>
              <MenuItem value="qualified">Calificado</MenuItem>
              <MenuItem value="lost">Perdido</MenuItem>
            </TextField>
          </>
        ) : null}
        {module === 'opportunities' ? (
          <>
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
            <TextField
              select
              label="Etapa"
              value={form.stage ?? 'qualified'}
              onChange={(event) => setField('stage', event.target.value)}
            >
              <MenuItem value="qualified">Calificada</MenuItem>
              <MenuItem value="proposal">Propuesta</MenuItem>
              <MenuItem value="negotiation">Negociación</MenuItem>
              <MenuItem value="won">Ganada</MenuItem>
              <MenuItem value="lost">Perdida</MenuItem>
            </TextField>
            <TextField
              label="Cierre esperado"
              type="datetime-local"
              value={form.expectedCloseDate ?? ''}
              onChange={(event) =>
                setField('expectedCloseDate', event.target.value)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        ) : null}
        {module === 'activities' ? (
          <>
            <TextField
              autoFocus
              label="Asunto"
              value={form.subject ?? ''}
              onChange={(event) => setField('subject', event.target.value)}
            />
            <TextField
              select
              label="Tipo"
              value={form.activityType ?? 'note'}
              onChange={(event) => setField('activityType', event.target.value)}
            >
              <MenuItem value="call">Llamada</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="meeting">Reunión</MenuItem>
              <MenuItem value="note">Nota</MenuItem>
              <MenuItem value="task">Tarea</MenuItem>
              <MenuItem value="follow_up">Seguimiento</MenuItem>
            </TextField>
            <TextField
              multiline
              minRows={3}
              label="Descripción"
              value={form.description ?? ''}
              onChange={(event) => setField('description', event.target.value)}
            />
            <TextField
              label="Programada para"
              type="datetime-local"
              value={form.scheduledAt ?? ''}
              onChange={(event) => setField('scheduledAt', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        ) : null}
      </FormDialog>
      <FormDialog
        open={Boolean(lifecycleResource)}
        onClose={() => {
          setLifecycleResource(null);
          setForm({});
        }}
        title={module === 'leads' ? 'Convertir lead' : 'Cerrar oportunidad'}
        subtitle={
          module === 'leads'
            ? 'Se creará una oportunidad enlazada al lead.'
            : 'Selecciona el resultado comercial.'
        }
        actions={
          module === 'leads' ? (
            <>
              <Button onClick={() => setLifecycleResource(null)}>
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
              <Button onClick={() => setLifecycleResource(null)}>
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
        onClose={() => setConfirmResource(null)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
};
