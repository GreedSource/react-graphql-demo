import { useUserStore } from '@/stores/user.store';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const AuthLayout = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.18),_transparent_28%),linear-gradient(160deg,_#020617_0%,_#0f172a_55%,_#164e63_100%)] px-4 py-10 sm:px-6 md:px-8">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-2xl backdrop-blur lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            GraphQL Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Administra usuarios, roles y permisos desde un solo flujo.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-slate-200">
            Este panel esta preparado para autenticacion persistente, CRUDs
            administrativos y crecimiento futuro cuando el backend habilite los
            endpoints faltantes.
          </p>
        </div>
        <div className="w-full rounded-[32px] border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
