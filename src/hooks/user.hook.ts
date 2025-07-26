import { LOGIN } from '@/graphql/auth/mutations';
import { GET_USER, GET_USERS } from '@/graphql/user/queries';
import { useQuery, useMutation } from '@apollo/client';

// Hook para obtener usuarios
export function useUsers() {
  return useQuery(GET_USERS);
}

export function useUser() {
  return useQuery(GET_USER);
}

// Hook para agregar usuario
export function useAddUser() {
  return useMutation(GET_USER);
}

export const useLogin = () => {
  const [login, { data, loading, error }] = useMutation(LOGIN);

  return {
    login, // login({ variables: { username, password } })
    data,
    loading,
    error,
  };
};
