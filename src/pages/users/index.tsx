import * as React from 'react';
import { Alert, Button } from '@mui/material';
import { FormDialog } from '@/components/ui/FormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import UserDetailPanel from './components/UserDetailPanel';
import UserFormFields from './components/UserFormFields';
import { useUsersPage } from './hooks/useUsersPage';

const UsersPageContent: React.FC = () => {
  const {
    usersQuery, users, roles, selectedId, setSelectedId, editOpen, setEditOpen,
    deleteOpen, setDeleteOpen, formState, setFormState, formErrors, selectedUser,
    openEdit, handleUpdate, handleDelete, updateState, deleteState,
  } = useUsersPage();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usuarios"
        title="Gestion de usuarios"
        description="Consulta el detalle de cada usuario, actualiza sus datos basicos y asigna roles existentes."
      />

      {usersQuery.error ? (
        <Alert severity="error">
          {getApolloErrorMessage(usersQuery.error)}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Listado" badge={users.length}>
          {usersQuery.loading && !users.length ? (
            <StateCard
              title="Cargando usuarios"
              description="Consultando el listado desde GraphQL."
              loading
            />
          ) : users.length ? (
            <DataTable
              rows={users}
              getRowKey={(item) => item.id}
              selectedRowKey={selectedId}
              onRowClick={(user) => setSelectedId(user.id)}
              searchable
              searchPlaceholder="Buscar por nombre, correo o rol..."
              searchableFields={[
                (user) => `${user.name} ${user.lastname}`,
                (user) => user.email,
                (user) => user.role?.name || '',
              ]}
              columns={[
                {
                  key: 'name',
                  header: 'Usuario',
                  render: (user) => (
                    <span className="font-medium">
                      {user.name} {user.lastname}
                    </span>
                  ),
                },
                {
                  key: 'email',
                  header: 'Correo',
                  render: (user) => user.email,
                },
                {
                  key: 'role',
                  header: 'Rol',
                  render: (user) => user.role?.name || 'Sin rol',
                },
              ]}
            />
          ) : (
            <StateCard
              title="Sin usuarios"
              description="No hay registros todavia. El alta se realiza desde el flujo de registro."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Detalle"
          description="Selecciona un usuario para ver y editar su informacion."
        >
          <UserDetailPanel
            selectedUser={selectedUser}
            onEdit={openEdit}
            onDelete={() => setDeleteOpen(true)}
          />
        </SectionCard>
      </div>

      <FormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar usuario"
        subtitle="Actualiza los datos basicos y el rol asociado."
        actions={
          <>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleUpdate()}
              variant="contained"
              disabled={updateState.loading}
            >
              Guardar cambios
            </Button>
          </>
        }
      >
        <UserFormFields
          formState={formState}
          formErrors={formErrors}
          roles={roles}
          onChange={setFormState}
        />
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar usuario"
        description={`Esta accion eliminara a ${selectedUser?.email || 'este usuario'} de forma permanente.`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
};

export default UsersPageContent;
