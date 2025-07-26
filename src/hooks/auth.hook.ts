import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { PROFILE } from '@/graphql/auth/queries';
import { useUserStore } from '@/stores/user.store';
import { logoutAll } from '@/utils/global';

export function useSessionCheck() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, setUser, logout } = useUserStore();

  const [getProfile] = useLazyQuery(PROFILE, {
    fetchPolicy: 'network-only',
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    onCompleted: (data) => {
      if (data?.profile) {
        setUser(data.profile);
      } else {
        handleLogout();
      }
    },
    onError: () => {
      // Si da error, la sesión no es válida
      handleLogout();
    },
  });

  function handleLogout() {
    logoutAll().then(() => {
      logout(); // limpiar store
      navigate('/login');
    });
  }

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      handleLogout();
      return;
    }
    getProfile();
    //eslint-disable-next-line
  }, [accessToken, refreshToken]);

  // No retorna nada, solo valida sesión
}
