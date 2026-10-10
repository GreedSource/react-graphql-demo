import * as React from 'react';
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded';
import KeyRounded from '@mui/icons-material/KeyRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormDialog } from '@/components/ui/FormDialog';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import RoleDetailPanel from './components/RoleDetailPanel';
import RoleFormFields from './components/RoleFormFields';
import RoleList from './components/RoleList';
import { useRolesPage } from './hooks/useRolesPage';

const RolesPageContent: React.FC = () => {
  const {
    rolesQuery, roles, permissions, selectedId, setSelectedId, dialogMode,
    dialogOpen, setDialogOpen, deleteOpen, setDeleteOpen, assignIds, setAssignIds,
    removeIds, setRemoveIds, formState, setFormState, selectedRole, assignedPermissions,
    openCreate, openEdit, handleSave, handleDelete, handleSavePermissions,
    createState, updateState, deleteState, addPermissionsState, removePermissionsState,
  } = useRolesPage();
  const activeRoles = roles.filter((role) => role.active).length;
  const assignedPermissionTotal = roles.reduce((total, role) => total + role.permissions.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roles"
        title="Gestión de roles"
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de roles">
        <MetricCard label="Roles totales" value={roles.length} detail="Configurados en el sistema" icon={<PeopleAltRounded />} />
        <MetricCard label="Roles activos" value={activeRoles} detail={`${roles.length - activeRoles} inactivos`} icon={<ShieldRounded />} tone="green" />
        <MetricCard label="Permisos disponibles" value={permissions.length} detail="En el catálogo global" icon={<KeyRounded />} tone="blue" />
        <MetricCard label="Asignaciones" value={assignedPermissionTotal} detail="Permisos en los roles" icon={<AdminPanelSettingsRounded />} tone="amber" />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(290px,0.72fr)_minmax(0,1.45fr)]">
        <SectionCard
          title="Roles"
          description="Selecciona un rol para administrar su acceso."
          badge={roles.length}
          icon={<PeopleAltRounded />}
          className="xl:sticky xl:top-6"
        >
          <RoleList
            roles={roles}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={openCreate}
            loading={rolesQuery.loading}
          />
        </SectionCard>

        <SectionCard
          title="Detalle del rol"
          description="Define exactamente qué puede consultar o modificar."
          icon={<AdminPanelSettingsRounded />}
          className="min-w-0"
        >
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
        subtitle="Configura el nombre, la descripción y el estado del rol."
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
