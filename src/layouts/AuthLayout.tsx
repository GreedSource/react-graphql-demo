import { useUserStore } from '@/stores/user.store';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const AuthLayout = () => {
  const navigate = useNavigate();
  const { accessToken, user } = useUserStore();

  useEffect(() => {
    if (accessToken && user) {
      // Ya autenticado, redirige al dashboard
      navigate('/');
    }
  }, [accessToken, user, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 sm:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
