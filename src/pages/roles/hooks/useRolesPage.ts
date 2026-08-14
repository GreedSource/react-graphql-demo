import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { usePermissions } from '@/hooks/permission.hook';
import { useRole, useRoleMutations, useRoles } from '@/hooks/role.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CreateRoleInput, UpdateRoleInput } from '@/types/admin';

const createRoleForm: CreateRoleInput = { name: '', description: '', active: true };

export const useRolesPage = () => {
  const rolesQuery = useRoles();
  const permissionsQuery = usePermissions();
  const {
    createRole, updateRole, deleteRole, addPermissionsToRole, removePermissionsFromRole,
    createState, updateState, deleteState, addPermissionsState, removePermissionsState,
  } = useRoleMutations();
  const roles = useMemo(() => rolesQuery.data?.roles?.data ?? [], [rolesQuery.data]);
  const permissions = useMemo(() => permissionsQuery.data?.permissions?.data ?? [], [permissionsQuery.data]);
  const [selectedId, setSelectedId] = useState('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignIds, setAssignIds] = useState<string[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [formState, setFormState] = useState<CreateRoleInput & { id?: string }>(createRoleForm);
  const roleDetailQuery = useRole(selectedId);

  useEffect(() => {
    if (!selectedId && roles.length > 0) setSelectedId(roles[0].id);
  }, [roles, selectedId]);

  const selectedRole = useMemo(
    () => roleDetailQuery.data?.role?.data ?? roles.find((role) => role.id === selectedId),
    [roleDetailQuery.data?.role?.data, roles, selectedId],
  );
  const assignedPermissions = useMemo(() => {
    if (!selectedRole) return [];
    return permissions.filter((permission) => selectedRole.permissions.some(
      (item) => item.type === permission.moduleKey && item.action === permission.actionKey,
    ));
  }, [permissions, selectedRole]);

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
        if (!roleId) throw new Error('No se encontro el identificador del rol a editar.');
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
  const handleSavePermissions = async () => {
    if (!selectedRole || (!assignIds.length && !removeIds.length)) return;
    try {
      if (assignIds.length) await addPermissionsToRole(selectedRole.id, assignIds);
      if (removeIds.length) await removePermissionsFromRole(selectedRole.id, removeIds);
      toast.success('Permisos del rol actualizados.');
      setAssignIds([]);
      setRemoveIds([]);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return {
    rolesQuery, roles, permissions, selectedId, setSelectedId, dialogMode,
    dialogOpen, setDialogOpen, deleteOpen, setDeleteOpen, assignIds, setAssignIds,
    removeIds, setRemoveIds, formState, setFormState, selectedRole, assignedPermissions,
    openCreate, openEdit, handleSave, handleDelete, handleSavePermissions,
    createState, updateState, deleteState, addPermissionsState, removePermissionsState,
  };
};
