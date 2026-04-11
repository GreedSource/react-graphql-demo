import { useMutation, useQuery } from '@apollo/client';
import { DELETE_USER, UPDATE_USER } from '@/graphql/user/mutations';
import { USER, USERS } from '@/graphql/user/queries';
import { ensureSuccess } from '@/lib/graphql';
import type { ApiResponse, UpdateUserInput, User } from '@/types/admin';

interface UsersQueryResult {
  users: ApiResponse<User[]>;
}

interface UserQueryResult {
  user: ApiResponse<User>;
}

interface UpdateUserMutationResult {
  updateUser: ApiResponse<User>;
}

interface DeleteUserMutationResult {
  deleteUser: ApiResponse<boolean>;
}

export function useUsers() {
  return useQuery<UsersQueryResult>(USERS, {
    fetchPolicy: 'cache-and-network',
  });
}

export function useUser(id?: string) {
  return useQuery<UserQueryResult>(USER, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });
}

export function useUserMutations() {
  const [updateUserMutation, updateState] =
    useMutation<UpdateUserMutationResult>(UPDATE_USER);
  const [deleteUserMutation, deleteState] =
    useMutation<DeleteUserMutationResult>(DELETE_USER);

  const updateUser = async (input: UpdateUserInput) => {
    const { data } = await updateUserMutation({
      variables: { input },
      refetchQueries: [{ query: USERS }, { query: USER, variables: { id: input.id } }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.updateUser, 'No se pudo actualizar el usuario.');
  };

  const deleteUser = async (id: string) => {
    const { data } = await deleteUserMutation({
      variables: { id },
      refetchQueries: [{ query: USERS }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.deleteUser, 'No se pudo eliminar el usuario.');
  };

  return {
    updateUser,
    deleteUser,
    updateState,
    deleteState,
  };
}
