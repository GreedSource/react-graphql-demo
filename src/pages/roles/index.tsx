import { useEffect, useMemo, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { usePermissions } from '@/hooks/permission.hook';
import { useRole, useRoleMutations, useRoles } from '@/hooks/role.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CreateRoleInput, UpdateRoleInput } from '@/types/admin';
import RoleDetailPanel from './role-detail-panel';
import RoleFormFields from './role-form-fields';

const createRoleForm: CreateRoleInput = {
  name: '',
  description: '',
  active: true,
};

export default function RolesPage() {
  const rolesQuery = useRoles();
  const permissionsQuery = usePermissions();
  const {
    createRole,
    updateRole,
    deleteRole,
    addPermissionsToRole,
    removePermissionsFromRole,
    createState,
    updateState,
    deleteState,
    addPermissionsState,
    removePermissionsState,
  } = useRoleMutations();
  const roles = useMemo(
    () => rolesQuery.data?.roles?.data ?? [],
    [rolesQuery.data],
  );
  const permissions = useMemo(
    () => permissionsQuery.data?.permissions?.data ?? [],
    [permissionsQuery.data],
  );
  const [selectedId, setSelectedId] = useState('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignIds, setAssignIds] = useState<string[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [formState, setFormState] = useState<CreateRoleInput & { id?: string }>(
    createRoleForm,
  );
  const roleDetailQuery = useRole(selectedId);

  useEffect(() => {
    if (!selectedId && roles.length > 0) {
      setSelectedId(roles[0].id);
    }
  }, [roles, selectedId]);

  const selectedRole = useMemo(() => {
    return (
      roleDetailQuery.data?.role?.data ??
      roles.find((role) => role.id === selectedId)
    );
  }, [roleDetailQuery.data?.role?.data, roles, selectedId]);

  const assignedPermissions = useMemo(() => {
    if (!selectedRole) return [];

    return permissions.filter((permission) =>
      selectedRole.permissions.some((item) => {
        const matches =
          item.type === permission.moduleKey &&
          item.action === permission.actionKey;
        return matches;
      }),
    );
  }, [permissions, selectedRole]);

  const availablePermissions = permissions.filter(
    (permission) =>
      !assignedPermissions.some((item) => item.id === permission.id),
  );

  const openCreate = () => {
    setDialogMode('create');
    setFormState(createRoleForm);
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (!selectedRole) return;
    setDialogMode('edit');
    setFormState({
      id: selectedRole.id,
      name: selectedRole.name,
      description: selectedRole.description || '',
      active: selectedRole.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        const response = await createRole(formState);
        toast.success(response.message || 'Rol creado.');
      } else {
        const roleId = formState.id || selectedRole?.id;

        if (!roleId) {
          throw new Error('No se encontro el identificador del rol a editar.');
        }

        const payload: UpdateRoleInput = {
          id: roleId,
          name: formState.name,
          description: formState.description,
          active: formState.active,
        };

        const response = await updateRole(payload);
        toast.success(response.message || 'Rol actualizado.');
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;

    try {
      const response = await deleteRole(selectedRole.id);
      toast.success(response.message || 'Rol eliminado.');
      setDeleteOpen(false);
      setSelectedId('');
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole || assignIds.length === 0) return;

    try {
      const response = await addPermissionsToRole(selectedRole.id, assignIds);
      toast.success(response.message || 'Permisos asignados.');
      setAssignIds([]);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleRemovePermissions = async () => {
    if (!selectedRole || removeIds.length === 0) return;

    try {
      const response = await removePermissionsFromRole(
        selectedRole.id,
        removeIds,
      );
      toast.success(response.message || 'Permisos removidos.');
      setRemoveIds([]);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roles"
        title="Gestion de roles"
        description="Crea roles, ajusta su estado y administra la asignacion o remocion de permisos."
        actions={
          <Button variant="contained" onClick={openCreate}>
            Nuevo rol
          </Button>
        }
      />

      {rolesQuery.error ? (
        <Alert severity="error">
          {getApolloErrorMessage(rolesQuery.error)}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Listado de roles" badge={roles.length}>
          {roles.length ? (
            <DataTable
              rows={roles}
              getRowKey={(role) => role.id}
              selectedRowKey={selectedId}
              onRowClick={(role) => setSelectedId(role.id)}
              searchable
              searchPlaceholder="Buscar por nombre de rol..."
              searchableFields={[(role) => role.name]}
              columns={[
                {
                  key: 'name',
                  header: 'Rol',
                  render: (role) => (
                    <span className="font-medium">{role.name}</span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Estado',
                  render: (role) => <StatusChip active={role.active} />,
                },
                {
                  key: 'permissions',
                  header: 'Permisos',
                  render: (role) => role.permissions.length,
                },
              ]}
            />
          ) : (
            <StateCard
              title="Sin roles"
              description="Crea el primer rol administrativo para continuar."
            />
          )}
        </SectionCard>

        <SectionCard title="Detalle y permisos">
          <RoleDetailPanel
            selectedRole={selectedRole}
            permissions={permissions}
            assignedPermissions={assignedPermissions}
            availablePermissions={availablePermissions}
            assignIds={assignIds}
            removeIds={removeIds}
            onAssignIdsChange={setAssignIds}
            onRemoveIdsChange={setRemoveIds}
            onEdit={openEdit}
            onDelete={() => setDeleteOpen(true)}
            onAssignPermissions={() => void handleAssignPermissions()}
            onRemovePermissions={() => void handleRemovePermissions()}
            addPermissionsLoading={addPermissionsState.loading}
            removePermissionsLoading={removePermissionsState.loading}
          />
        </SectionCard>
      </div>

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogMode === 'create' ? 'Crear rol' : 'Editar rol'}
        subtitle="Configura el nombre, la descripcion y el estado del rol."
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
        <RoleFormFields formState={formState} onChange={setFormState} />
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar rol"
        description={`Se eliminara el rol ${selectedRole?.name || ''}. Verifica antes de continuar.`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
}
