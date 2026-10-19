import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCrmOrganization, useCrmResources } from '@/hooks/crm.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CRMModule, CRMResource, CRMResourceInput } from '@/types/crm';

const moduleLabels: Record<CRMModule, string> = {
  companies: 'empresa',
  contacts: 'contacto',
  leads: 'lead',
  opportunities: 'oportunidad',
  activities: 'actividad',
};

export function useCRMResourcePage(module: CRMModule, title: string) {
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CRMResource | null>(null);
  const [confirmResource, setConfirmResource] = useState<CRMResource | null>(null);
  const [lifecycleResource, setLifecycleResource] = useState<CRMResource | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
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

  const closeDialog = () => setDialogOpen(false);
  const openDeleteDialog = (resource: CRMResource) => setConfirmResource(resource);
  const closeDeleteDialog = () => setConfirmResource(null);
  const openLifecycle = (
    resource: CRMResource,
    initialForm: Record<string, string> = {},
  ) => {
    setForm(initialForm);
    setLifecycleResource(resource);
  };
  const closeLifecycle = () => {
    setLifecycleResource(null);
    setForm({});
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
      toast.success(response.message || `${label} ${editing ? 'actualizado' : 'creado'}.`);
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
      const response = module === 'leads'
        ? await convertLead({
            id: lifecycleResource.id,
            opportunityName: form.opportunityName || `${lifecycleResource.name} · Oportunidad`,
            value: form.value || '0',
            probability: Number(form.probability || 0),
          })
        : await closeOpportunity({ id: lifecycleResource.id, stage: stage || 'won' });
      toast.success(response.message || 'Estado comercial actualizado.');
      closeLifecycle();
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!confirmResource) return;

    try {
      const response = await deleteResource(confirmResource.id);
      toast.success(response.message || `${title} eliminado.`);
      closeDeleteDialog();
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const valid = Boolean(
    organizationId &&
    (module === 'activities' ? form.subject?.trim() : form.name?.trim()) &&
    (module !== 'contacts' || form.lastname?.trim()),
  );

  return {
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
  };
}
