import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAuthBootstrap } from '@/hooks/auth.hook';
import { useUserStore } from '@/stores/user.store';

export function GuestRoute() {
  const { isReady } = useAuthBootstrap();
  const { user } = useUserStore();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <CircularProgress sx={{ color: 'white' }} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
