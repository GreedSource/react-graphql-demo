import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PERMISSION, DELETE_PERMISSION } from '@/graphql/permission/mutations';
import { PERMISSIONS } from '@/graphql/permission/queries';
import { ensureSuccess } from '@/lib/graphql';
import type {
  ApiResponse,
  CreatePermissionInput,
  Permission,
} from '@/types/admin';

interface PermissionsQueryResult {
  permissions: ApiResponse<Permission[]>;
}

interface PermissionMutationResult {
  createPermission: ApiResponse<Permission>;
}

interface DeletePermissionResult {
  deletePermission: boolean;
}

export function usePermissions() {
  return useQuery<PermissionsQueryResult>(PERMISSIONS, {
    fetchPolicy: 'cache-and-network',
  });
}

export function usePermissionMutations() {
  const [createPermissionMutation, createState] =
    useMutation<PermissionMutationResult>(CREATE_PERMISSION);
  const [deletePermissionMutation, deleteState] =
    useMutation<DeletePermissionResult>(DELETE_PERMISSION);

  const createPermission = async (input: CreatePermissionInput) => {
    const { data } = await createPermissionMutation({
      variables: { input },
      refetchQueries: [{ query: PERMISSIONS }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.createPermission, 'No se pudo crear el permiso.');
  };

  const deletePermission = async (id: string) => {
    const { data } = await deletePermissionMutation({
      variables: { id },
      refetchQueries: [{ query: PERMISSIONS }],
      awaitRefetchQueries: true,
    });

    if (!data?.deletePermission) {
      throw new Error('No se pudo eliminar el permiso.');
    }

    return true;
  };

  return {
    createPermission,
    deletePermission,
    createState,
    deleteState,
  };
}
