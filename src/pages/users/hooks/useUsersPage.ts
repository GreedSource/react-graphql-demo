import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useRoles } from '@/hooks/role.hook';
import { useUser, useUserMutations, useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { UpdateUserInput } from '@/types/admin';

const emptyForm: UpdateUserInput = { id: '', name: '', lastname: '', roleId: '' };

export const useUsersPage = () => {
  const usersQuery = useUsers();
  const rolesQuery = useRoles();
  const { updateUser, deleteUser, updateState, deleteState } = useUserMutations();
  const users = useMemo(() => usersQuery.data?.users?.data ?? [], [usersQuery.data]);
  const roles = useMemo(() => rolesQuery.data?.roles?.data ?? [], [rolesQuery.data]);
  const [selectedId, setSelectedId] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formState, setFormState] = useState<UpdateUserInput>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<'name' | 'lastname', string>>>({});
  const userDetailQuery = useUser(selectedId);

  useEffect(() => {
    if (!selectedId && users.length > 0) setSelectedId(users[0].id);
  }, [selectedId, users]);

  const selectedUser = useMemo(
    () => userDetailQuery.data?.user?.data ?? users.find((user) => user.id === selectedId),
    [selectedId, userDetailQuery.data?.user?.data, users],
  );

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

  return {
    usersQuery, users, roles, selectedId, setSelectedId, editOpen, setEditOpen,
    deleteOpen, setDeleteOpen, formState, setFormState, formErrors, selectedUser,
    openEdit, handleUpdate, handleDelete, updateState, deleteState,
  };
};
