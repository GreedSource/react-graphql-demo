import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CircularProgress } from '@mui/material';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/profile'));
const UsersPage = lazy(() => import('./pages/users'));
const RolesPage = lazy(() => import('./pages/roles'));
const ModulesPage = lazy(() => import('./pages/modules'));
const ActionsPage = lazy(() => import('./pages/actions'));
const PermissionsPage = lazy(() => import('./pages/permissions'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RecoverPassword = lazy(() => import('./pages/auth/RecoverPassword'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const NotFound = lazy(() =>
  import('./pages/not-found').then((module) => ({ default: module.NotFound })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <CircularProgress sx={{ color: 'white' }} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3500} />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/modules" element={<ModulesPage />} />
              <Route path="/actions" element={<ActionsPage />} />
              <Route path="/permissions" element={<PermissionsPage />} />
            </Route>
          </Route>

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
