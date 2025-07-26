import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard';
import Home from './pages/home';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RecoverPassword from './pages/auth/RecoverPassword';
import ChangePassword from './pages/auth/ChangePassword';
import { ToastContainer } from 'react-toastify';
import { NotFound } from './pages/not-found';

const App = () => {
  return (
    <>
      <ToastContainer />
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

        {/* otras rutas */}
        {/* Ruta catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
