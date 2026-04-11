import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RecoverPassword = lazy(() => import('./pages/auth/RecoverPassword'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const NotFound = lazy(() =>
  import('./pages/not-found').then((module) => ({ default: module.NotFound }))
);

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
    Loading...
  </div>
);

const App = () => {
  return (
    <>
      <ToastContainer />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" index element={<Home />} />
            <Route path="/dashboard" index element={<Dashboard />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover-password" element={<RecoverPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
