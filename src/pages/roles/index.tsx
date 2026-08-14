import * as React from 'react';
import { Alert, Button } from '@mui/material';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { getApolloErrorMessage } from '@/lib/graphql';
import RoleDetailPanel from './components/RoleDetailPanel';
import RoleFormFields from './components/RoleFormFields';
import { useRolesPage } from './hooks/useRolesPage';

const RolesPageContent: React.FC = () => {
  const {
    rolesQuery, roles, permissions, selectedId, setSelectedId, dialogMode,
    dialogOpen, setDialogOpen, deleteOpen, setDeleteOpen, assignIds, setAssignIds,
    removeIds, setRemoveIds, formState, setFormState, selectedRole, assignedPermissions,
    openCreate, openEdit, handleSave, handleDelete, handleSavePermissions,
    createState, updateState, deleteState, addPermissionsState, removePermissionsState,
  } = useRolesPage();

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
            assignIds={assignIds}
            removeIds={removeIds}
            onAssignIdsChange={setAssignIds}
            onRemoveIdsChange={setRemoveIds}
            onEdit={openEdit}
            onDelete={() => setDeleteOpen(true)}
            onSavePermissions={() => void handleSavePermissions()}
            permissionsLoading={addPermissionsState.loading || removePermissionsState.loading}
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
};

export default RolesPageContent;
