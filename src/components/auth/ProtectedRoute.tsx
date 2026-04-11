import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import {
  useAuthenticatedUserSubscription,
  useAuthBootstrap,
} from '@/hooks/auth.hook';
import { useUserStore } from '@/stores/user.store';

export function ProtectedRoute() {
  const location = useLocation();
  const { isReady } = useAuthBootstrap();
  const { user } = useUserStore();

  useAuthenticatedUserSubscription();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <CircularProgress sx={{ color: 'white' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
