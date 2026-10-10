import * as React from 'react';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import LoginRounded from '@mui/icons-material/LoginRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FormDialog } from '@/components/ui/FormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { getApolloErrorMessage } from '@/lib/graphql';
import UserFormFields from './components/UserFormFields';
import { useUsersPage } from './hooks/useUsersPage';

const UsersPageContent: React.FC = () => {
  const {
    usersQuery, users, roles, currentUser, impersonation, canEditRole, roleHelperText,
    editOpen, setEditOpen, deleteOpen, setDeleteOpen,
    formState, setFormState, formErrors, selectedUser, openEdit, openDelete,
    startImpersonation, impersonateState, handleUpdate, handleDelete, updateState, deleteState,
  } = useUsersPage();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usuarios"
        title="Gestión de usuarios"
        description="Actualiza los datos personales y gestiona el rol de otros usuarios sin poner en riesgo tu propio acceso."
      />

      {usersQuery.error ? (
        <Alert severity="error">
          {getApolloErrorMessage(usersQuery.error)}
        </Alert>
      ) : null}

      <SectionCard title="Usuarios" description="Edita nombres y roles de otras cuentas; tu propio rol siempre queda protegido." badge={users.length}>
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
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-xs font-bold uppercase text-accent">
                        {`${user.name[0] ?? ''}${user.lastname[0] ?? ''}`}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-text">{user.name} {user.lastname}</span>
                        <span className="block truncate text-xs text-text-muted">{user.email}</span>
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'role',
                  header: 'Rol',
                  render: (user) => (
                    <span className="inline-flex rounded-full bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-text-secondary">
                      {user.role?.name || 'Sin rol'}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Acciones',
                  align: 'right',
                  render: (user) => (
                    <div className="flex justify-end gap-1">
                      {!impersonation && user.id !== currentUser?.id ? (
                        <PermissionAction
                          permission="users.impersonate"
                          size="small"
                          startIcon={<LoginRounded fontSize="small" />}
                          disabled={impersonateState.loading}
                          onClick={(event) => {
                            event.stopPropagation();
                            void startImpersonation(user);
                          }}
                        >
                          {impersonateState.loading ? 'Entrando...' : 'Impersonar'}
                        </PermissionAction>
                      ) : null}
                      <Tooltip title="Editar usuario">
                        <IconButton
                          aria-label={`Editar a ${user.name} ${user.lastname}`}
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(user);
                          }}
                          sx={{
                            color: 'var(--text-secondary)',
                            '&:hover': { color: 'var(--accent)', bgcolor: 'var(--accent-soft)' },
                          }}
                        >
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.id === currentUser?.id ? 'No puedes eliminar tu propio usuario' : !currentUser?.id ? 'No se puede eliminar hasta verificar tu sesión' : 'Eliminar usuario'}>
                        <span className={!currentUser?.id || user.id === currentUser.id ? 'inline-flex cursor-not-allowed' : 'inline-flex'}>
                          <IconButton
                            aria-label={`Eliminar a ${user.name} ${user.lastname}`}
                            size="small"
                            disabled={!currentUser?.id || user.id === currentUser.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              openDelete(user);
                            }}
                            sx={{
                              color: 'var(--text-secondary)',
                              '&:hover': { color: 'var(--error, #c45147)', bgcolor: 'var(--danger-soft)' },
                              '&.Mui-disabled': { color: 'var(--text-muted)', opacity: 0.55 },
                            }}
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </div>
                  ),
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

      <FormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar usuario"
        subtitle="Actualiza el nombre, apellido y, si corresponde, el rol. El correo no se puede editar y tu propio rol queda protegido."
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
          roleDisabled={!canEditRole}
          roleHelperText={roleHelperText}
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
