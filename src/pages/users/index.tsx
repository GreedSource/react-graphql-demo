import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  TextField,
} from '@mui/material';
import { FormDialog } from '@/components/ui/FormDialog';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { useRoles } from '@/hooks/role.hook';
import { useUser, useUserMutations, useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { UpdateUserInput } from '@/types/admin';

const emptyForm: UpdateUserInput = {
  id: '',
  name: '',
  lastname: '',
  roleId: '',
};

export default function UsersPage() {
  const usersQuery = useUsers();
  const rolesQuery = useRoles();
  const { updateUser, deleteUser, updateState, deleteState } = useUserMutations();
  const users = useMemo(() => usersQuery.data?.users?.data ?? [], [usersQuery.data]);
  const roles = useMemo(() => rolesQuery.data?.roles?.data ?? [], [rolesQuery.data]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formState, setFormState] = useState<UpdateUserInput>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<'name' | 'lastname', string>>>({});
  const userDetailQuery = useUser(selectedId);

  useEffect(() => {
    if (!selectedId && users.length > 0) {
      setSelectedId(users[0].id);
    }
  }, [selectedId, users]);

  const selectedUser = useMemo(() => {
    return userDetailQuery.data?.user?.data ?? users.find((user) => user.id === selectedId);
  }, [selectedId, userDetailQuery.data?.user?.data, users]);

  const openEdit = () => {
    if (!selectedUser) return;
    setFormState({
      id: selectedUser.id,
      name: selectedUser.name,
      lastname: selectedUser.lastname,
      roleId: selectedUser.role?.id ?? '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const validate = () => {
    const errors: Partial<Record<'name' | 'lastname', string>> = {};
    if (!formState.name?.trim()) errors.name = 'El nombre es obligatorio.';
    if (!formState.lastname?.trim()) errors.lastname = 'El apellido es obligatorio.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      const response = await updateUser({
        id: formState.id,
        name: formState.name,
        lastname: formState.lastname,
        roleId: formState.roleId || undefined,
      });
      toast.success(response.message || 'Usuario actualizado.');
      setEditOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await deleteUser(selectedUser.id);
      toast.success(response.message || 'Usuario eliminado.');
      setDeleteOpen(false);
      setSelectedId('');
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usuarios"
        title="Gestion de usuarios"
        description="Consulta el detalle de cada usuario, actualiza sus datos basicos y asigna roles existentes."
      />

      {usersQuery.error ? (
        <Alert severity="error">{getApolloErrorMessage(usersQuery.error)}</Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Listado">
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

        <SectionCard title="Detalle" description="Selecciona un usuario para ver y editar su informacion.">
          {selectedUser ? (
            <div className="space-y-4 text-sm text-text-secondary">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Nombre completo
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {selectedUser.name} {selectedUser.lastname}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Correo
                </p>
                <p className="mt-1">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Rol actual
                </p>
                <p className="mt-1">{selectedUser.role?.name || 'Sin rol asignado'}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="contained" onClick={openEdit}>
                  Editar
                </Button>
                <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <StateCard
              title="Sin seleccion"
              description="Elige un usuario en la tabla para abrir su detalle."
            />
          )}
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
          <TextField
            label="Nombre"
            value={formState.name ?? ''}
            onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
            size="small"
            fullWidth
          />
          <TextField
            label="Apellido"
            value={formState.lastname ?? ''}
            onChange={(event) => setFormState((current) => ({ ...current, lastname: event.target.value }))}
            error={Boolean(formErrors.lastname)}
            helperText={formErrors.lastname}
            size="small"
            fullWidth
          />
          <TextField
            label="Rol"
            value={formState.roleId ?? ''}
            onChange={(event) => setFormState((current) => ({ ...current, roleId: event.target.value }))}
            select
            size="small"
            fullWidth
          >
            <MenuItem value="">Sin rol</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
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
}
