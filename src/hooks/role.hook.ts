import { useMutation, useQuery } from '@apollo/client';
import {
  ADD_PERMISSIONS_TO_ROLE,
  CREATE_ROLE,
  DELETE_ROLE,
  REMOVE_PERMISSIONS_FROM_ROLE,
  UPDATE_ROLE,
} from '@/graphql/role/mutations';
import { ROLE, ROLES } from '@/graphql/role/queries';
import { ensureSuccess } from '@/lib/graphql';
import type {
  ApiResponse,
  CreateRoleInput,
  Role,
  UpdateRoleInput,
} from '@/types/admin';

interface RolesQueryResult {
  roles: ApiResponse<Role[]>;
}

interface RoleQueryResult {
  role: ApiResponse<Role>;
}

interface RoleMutationResult {
  createRole: ApiResponse<Role>;
  updateRole: ApiResponse<Role>;
}

interface BooleanMutationResult {
  deleteRole: ApiResponse<boolean>;
  addPermissionsToRole: ApiResponse<boolean>;
  removePermissionsFromRole: ApiResponse<boolean>;
}

export function useRoles(skip = false) {
  return useQuery<RolesQueryResult>(ROLES, {
    skip,
    fetchPolicy: 'cache-and-network',
  });
}

export function useRole(id?: string) {
  return useQuery<RoleQueryResult>(ROLE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });
}

export function useRoleMutations() {
  const [createRoleMutation, createState] =
    useMutation<RoleMutationResult>(CREATE_ROLE);
  const [updateRoleMutation, updateState] =
    useMutation<RoleMutationResult>(UPDATE_ROLE);
  const [deleteRoleMutation, deleteState] =
    useMutation<BooleanMutationResult>(DELETE_ROLE);
  const [addPermissionsMutation, addPermissionsState] =
    useMutation<BooleanMutationResult>(ADD_PERMISSIONS_TO_ROLE);
  const [removePermissionsMutation, removePermissionsState] =
    useMutation<BooleanMutationResult>(REMOVE_PERMISSIONS_FROM_ROLE);

  const createRole = async (input: CreateRoleInput) => {
    const { data } = await createRoleMutation({
      variables: { input },
      refetchQueries: [{ query: ROLES }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.createRole, 'No se pudo crear el rol.');
  };

  const updateRole = async (input: UpdateRoleInput) => {
    const { data } = await updateRoleMutation({
      variables: { input },
      refetchQueries: [
        { query: ROLES },
        { query: ROLE, variables: { id: input.id } },
      ],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.updateRole, 'No se pudo actualizar el rol.');
  };

  const deleteRole = async (id: string) => {
    const { data } = await deleteRoleMutation({
      variables: { id },
      refetchQueries: [{ query: ROLES }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.deleteRole, 'No se pudo eliminar el rol.');
  };

  const addPermissionsToRole = async (
    roleId: string,
    permissionIds: string[],
  ) => {
    const { data } = await addPermissionsMutation({
      variables: { roleId, permissionIds },
      refetchQueries: [
        { query: ROLES },
        { query: ROLE, variables: { id: roleId } },
      ],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(
      data?.addPermissionsToRole,
      'No se pudieron asignar permisos.',
    );
  };

  const removePermissionsFromRole = async (
    roleId: string,
    permissionIds: string[],
  ) => {
    const { data } = await removePermissionsMutation({
      variables: { roleId, permissionIds },
      refetchQueries: [
        { query: ROLES },
        { query: ROLE, variables: { id: roleId } },
      ],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(
      data?.removePermissionsFromRole,
      'No se pudieron remover permisos.',
    );
  };

  return {
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
  };
}
