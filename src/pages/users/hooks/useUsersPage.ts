import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { useAuthActions } from '@/hooks/auth.hook';
import { useRoles } from '@/hooks/role.hook';
import { useUserMutations, useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { useUserStore } from '@/stores/user.store';
import type { User } from '@/types/admin';
import type { UserEditFormState } from '../types';

const emptyForm: UserEditFormState = {
  id: '',
  name: '',
  lastname: '',
  email: '',
  roleId: '',
  roleName: '',
};

export const useUsersPage = () => {
  const usersQuery = useUsers();
  const rolesQuery = useRoles();
  const currentUser = useUserStore((state) => state.user);
  const impersonation = useUserStore((state) => state.impersonation);
  const location = useLocation();
  const { impersonateUser, impersonateState } = useAuthActions();
  const { updateUser, deleteUser, updateState, deleteState } = useUserMutations();
  const users = useMemo(() => usersQuery.data?.users?.data ?? [], [usersQuery.data]);
  const roles = useMemo(() => rolesQuery.data?.roles?.data ?? [], [rolesQuery.data]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formState, setFormState] = useState<UserEditFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<'name' | 'lastname', string>>>({});

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormState({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      roleId: user.role?.id ?? '',
      roleName: user.role?.name ?? '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const openDelete = (user: User) => {
    if (!currentUser?.id || user.id === currentUser.id) {
      toast.info(
        currentUser?.id
          ? 'No puedes eliminar tu propio usuario.'
          : 'No se puede eliminar el usuario hasta verificar tu sesión.',
      );
      return;
    }
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const startImpersonation = async (user: User) => {
    if (!currentUser?.id || user.id === currentUser.id || impersonation) {
      toast.info('Selecciona otro usuario para iniciar una sesión temporal.');
      return;
    }

    try {
      await impersonateUser(
        user.id,
        `${location.pathname}${location.search}${location.hash}`,
      );
      toast.info(`Ahora estás viendo la cuenta de ${user.name} ${user.lastname}.`);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
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
        ...(canEditRole ? { roleId: formState.roleId || undefined } : {}),
      });
      toast.success(response.message || 'Usuario actualizado.');
      setEditOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const canEditRole = Boolean(
    currentUser?.id && formState.id && formState.id !== currentUser.id,
  );
  const roleHelperText = canEditRole
    ? 'Puedes actualizar el rol de este usuario.'
    : currentUser?.id && formState.id === currentUser.id
      ? 'Tu rol no se puede modificar para proteger tu acceso a la plataforma.'
      : 'El rol se habilitará cuando se confirme tu sesión.';

  const handleDelete = async () => {
    if (!selectedUser || !currentUser?.id || selectedUser.id === currentUser.id) {
      setDeleteOpen(false);
      setSelectedUser(undefined);
      toast.error(
        currentUser?.id
          ? 'No puedes eliminar tu propio usuario.'
          : 'No se puede eliminar el usuario hasta verificar tu sesión.',
      );
      return;
    }
    try {
      const response = await deleteUser(selectedUser.id);
      toast.success(response.message || 'Usuario eliminado.');
      setDeleteOpen(false);
      setSelectedUser(undefined);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return {
    usersQuery, users, roles, currentUser, impersonation, canEditRole, roleHelperText,
    editOpen, setEditOpen, deleteOpen, setDeleteOpen,
    formState, setFormState, formErrors, selectedUser, openEdit, openDelete,
    handleUpdate, handleDelete, startImpersonation, impersonateState, updateState, deleteState,
  };
};
