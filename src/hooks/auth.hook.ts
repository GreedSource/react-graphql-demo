import {
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LOGIN,
  LOGOUT,
  RECOVER_PASSWORD,
  REFRESH_TOKEN,
  REGISTER,
  RESET_PASSWORD,
} from '@/graphql/auth/mutations';
import { PROFILE } from '@/graphql/auth/queries';
import { USER_UPDATED } from '@/graphql/auth/subscriptions';
import { ensureSuccess, getApolloErrorMessage } from '@/lib/graphql';
import { useUserStore } from '@/stores/user.store';
import type {
  ApiResponse,
  AuthPayload,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  User,
} from '@/types/admin';
import { logoutAll } from '@/utils/global';

interface ProfileQueryResult {
  profile: ApiResponse<User>;
}

interface AuthMutationResult {
  login: ApiResponse<AuthPayload>;
}

interface RegisterMutationResult {
  register: ApiResponse<AuthPayload>;
}

interface RecoverPasswordResult {
  recoverPassword: ApiResponse<boolean>;
}

interface ResetPasswordResult {
  resetPassword: ApiResponse<boolean>;
}

interface LogoutResult {
  logout: ApiResponse<boolean>;
}

interface RefreshMutationResult {
  refreshToken: ApiResponse<AuthPayload>;
}

interface UserUpdatedSubscriptionResult {
  userUpdated: User;
}

export function useProfileQuery(enabled = true) {
  return useQuery<ProfileQueryResult>(PROFILE, {
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
  });
}

export function useAuthActions() {
  const client = useApolloClient();
  const navigate = useNavigate();
  const { setSession, logout } = useUserStore();
  const [loginMutation, loginState] = useMutation<AuthMutationResult>(LOGIN);
  const [registerMutation, registerState] =
    useMutation<RegisterMutationResult>(REGISTER);
  const [recoverPasswordMutation, recoverPasswordState] =
    useMutation<RecoverPasswordResult>(RECOVER_PASSWORD);
  const [resetPasswordMutation, resetPasswordState] =
    useMutation<ResetPasswordResult>(RESET_PASSWORD);
  const [logoutMutation] = useMutation<LogoutResult>(LOGOUT);

  const login = async (input: LoginInput) => {
    const { data } = await loginMutation({ variables: { input } });
    const response = ensureSuccess(data?.login, 'No se pudo iniciar sesion.');
    setSession({
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
    return response;
  };

  const register = async (input: RegisterInput) => {
    const { data } = await registerMutation({ variables: { input } });
    const response = ensureSuccess(
      data?.register,
      'No se pudo crear la cuenta.',
    );
    setSession({
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
    return response;
  };

  const recoverPassword = async (email: string) => {
    const { data } = await recoverPasswordMutation({ variables: { email } });
    return ensureSuccess(
      data?.recoverPassword,
      'No se pudo enviar la solicitud de recuperacion.',
    );
  };

  const resetPassword = async (input: ResetPasswordInput) => {
    const { data } = await resetPasswordMutation({ variables: { input } });
    return ensureSuccess(
      data?.resetPassword,
      'No se pudo restablecer la contrasena.',
    );
  };

  const performLogout = async () => {
    try {
      await logoutMutation();
    } catch {
      // Si el backend falla igualmente limpiamos la sesion local.
    }

    await logoutAll();
    await client.clearStore();
    logout();
    navigate('/login', { replace: true });
  };

  return {
    login,
    register,
    recoverPassword,
    resetPassword,
    performLogout,
    loginState,
    registerState,
    recoverPasswordState,
    resetPasswordState,
  };
}

export function useAuthBootstrap() {
  const { user, sessionChecked, setSession, setSessionChecked, logout } =
    useUserStore();
  const [hasResolved, setHasResolved] = useState(false);
  const [fetchProfile, profileState] = useLazyQuery<ProfileQueryResult>(
    PROFILE,
    {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        const response = ensureSuccess(
          data?.profile,
          'No se pudo validar la sesion.',
        );
        setSession({ user: response.data });
        setSessionChecked(true);
        setHasResolved(true);
      },
      onError: async () => {
        await logoutAll();
        logout();
        setSessionChecked(true);
        setHasResolved(true);
      },
    },
  );

  useEffect(() => {
    if (sessionChecked && user?.role?.permissions) {
      setHasResolved(true);
      return;
    }

    fetchProfile();
  }, [fetchProfile, sessionChecked, user]);

  return {
    isReady: hasResolved && !profileState.loading,
    user,
    error: profileState.error
      ? getApolloErrorMessage(profileState.error)
      : null,
  };
}

/**
 * Lightweight bootstrap for guest routes.
 * Only checks if there's an existing session; does NOT fire a profile query
 * when the user is unauthenticated, avoiding unnecessary network calls and
 * expensive IndexedDB cleanup on first visit.
 */
export function useGuestBootstrap() {
  const { user, sessionChecked, accessToken } = useUserStore();

  // If there's no token at all, resolve immediately — no network call needed.
  if (!accessToken) {
    return { isReady: true, user: null };
  }

  // If we already checked and found no valid role, resolve immediately.
  if (sessionChecked && !user) {
    return { isReady: true, user: null };
  }

  // Still waiting — let useAuthBootstrap (on ProtectedRoute side) handle it.
  return { isReady: sessionChecked, user };
}

export function useSessionCheck() {
  return useAuthBootstrap();
}

export function useAuthenticatedUserSubscription() {
  const { user, setUser } = useUserStore();
  const client = useApolloClient();
  const { refetch: refetchProfile } = useProfileQuery(false);

  useSubscription<UserUpdatedSubscriptionResult>(USER_UPDATED, {
    skip: !user?.id,
    variables: {
      userId: user?.id,
    },
    onData: ({ data }) => {
      const nextUser = data.data?.userUpdated;

      if (!nextUser) {
        return;
      }

      setUser(nextUser);

      // Update Apollo cache with the new profile data so components using
      // useProfileQuery() immediately reflect the updated permissions
      client.cache.writeQuery({
        query: PROFILE,
        data: {
          profile: {
            __typename: 'ApiResponse',
            status: 200,
            message: 'Perfil actualizado',
            data: nextUser,
          },
        },
      });

      // Refetch profile to sync with backend
      void refetchProfile();
    },
    onError: () => {
      // Evitamos romper la UI si la suscripcion falla temporalmente.
    },
  });
}

export function useRefreshTokenAction() {
  const [refreshMutation] = useMutation<RefreshMutationResult>(REFRESH_TOKEN);
  const { setSession } = useUserStore();

  return async (refreshToken: string) => {
    const { data } = await refreshMutation({ variables: { refreshToken } });
    const response = ensureSuccess(
      data?.refreshToken,
      'No se pudo refrescar la sesion.',
    );
    setSession({
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
    return response;
  };
}
