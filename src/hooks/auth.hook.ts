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
  IMPERSONATE_USER,
  RECOVER_PASSWORD,
  REFRESH_TOKEN,
  REGISTER,
  RESET_PASSWORD,
  STOP_IMPERSONATION,
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

interface ImpersonateUserResult {
  impersonateUser: ApiResponse<AuthPayload>;
}

interface StopImpersonationResult {
  stopImpersonation: ApiResponse<AuthPayload>;
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

function persistAuthPayload(
  setSession: (payload: {
    user: User | null;
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => void,
  payload: AuthPayload,
) {
  setSession({
    user: payload.user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
}

export function useLoginAction() {
  const { setSession } = useUserStore();
  const [loginMutation, loginState] = useMutation<AuthMutationResult>(LOGIN);

  const login = async (input: LoginInput) => {
    const { data } = await loginMutation({ variables: { input } });
    const response = ensureSuccess(data?.login, 'No se pudo iniciar sesion.');
    persistAuthPayload(setSession, response.data);
    return response;
  };

  return { login, loginState };
}

export function useRegisterAction() {
  const { setSession } = useUserStore();
  const [registerMutation, registerState] =
    useMutation<RegisterMutationResult>(REGISTER);

  const register = async (input: RegisterInput) => {
    const { data } = await registerMutation({ variables: { input } });
    const response = ensureSuccess(
      data?.register,
      'No se pudo crear la cuenta.',
    );
    persistAuthPayload(setSession, response.data);
    return response;
  };

  return { register, registerState };
}

export function useRecoverPasswordAction() {
  const [recoverPasswordMutation, recoverPasswordState] =
    useMutation<RecoverPasswordResult>(RECOVER_PASSWORD);

  const recoverPassword = async (email: string) => {
    const { data } = await recoverPasswordMutation({ variables: { email } });
    return ensureSuccess(
      data?.recoverPassword,
      'No se pudo enviar la solicitud de recuperacion.',
    );
  };

  return { recoverPassword, recoverPasswordState };
}

export function useResetPasswordAction() {
  const [resetPasswordMutation, resetPasswordState] =
    useMutation<ResetPasswordResult>(RESET_PASSWORD);

  const resetPassword = async (input: ResetPasswordInput) => {
    const { data } = await resetPasswordMutation({ variables: { input } });
    return ensureSuccess(
      data?.resetPassword,
      'No se pudo restablecer la contrasena.',
    );
  };

  return { resetPassword, resetPasswordState };
}

export function useLogoutAction() {
  const client = useApolloClient();
  const navigate = useNavigate();
  const { logout } = useUserStore();
  const [logoutMutation] = useMutation<LogoutResult>(LOGOUT);

  const performLogout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      // A backend logout failure must not prevent local session cleanup.
      console.warn('Backend logout failed; clearing the local session.', error);
    }

    await logoutAll();
    await client.clearStore();
    logout();
    navigate('/login', { replace: true });
  };

  return { performLogout };
}

export function useImpersonateUserAction() {
  const client = useApolloClient();
  const navigate = useNavigate();
  const [impersonateMutation, impersonateState] =
    useMutation<ImpersonateUserResult>(IMPERSONATE_USER);

  const impersonateUser = async (userId: string, returnPath: string) => {
    const { data } = await impersonateMutation({ variables: { userId } });
    const response = ensureSuccess(
      data?.impersonateUser,
      'No se pudo iniciar la impersonación.',
    );
    useUserStore.getState().beginImpersonation(response.data, returnPath);
    await client.clearStore();
    navigate('/welcome', { replace: true });
    return response;
  };

  return { impersonateUser, impersonateState };
}

export function useStopImpersonationAction() {
  const client = useApolloClient();
  const navigate = useNavigate();
  const [stopImpersonationMutation, stopImpersonationState] =
    useMutation<StopImpersonationResult>(STOP_IMPERSONATION);

  const stopImpersonation = async () => {
    if (!useUserStore.getState().impersonation) {
      return null;
    }

    try {
      const { data } = await stopImpersonationMutation();
      const response = ensureSuccess(
        data?.stopImpersonation,
        'No se pudo regresar a la cuenta original.',
      );
      const returnPath =
        useUserStore.getState().endImpersonation(response.data) || '/users';
      await client.clearStore();
      navigate(returnPath, { replace: true });
      return response;
    } catch (error) {
      const returnPath =
        useUserStore.getState().restoreOriginalSession() || '/users';
      await client.clearStore();
      navigate(returnPath, { replace: true });
      throw error;
    }
  };

  return { stopImpersonation, stopImpersonationState };
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
        const currentState = useUserStore.getState();
        if (currentState.user && currentState.accessToken) {
          setSessionChecked(true);
          setHasResolved(true);
          return;
        }

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
