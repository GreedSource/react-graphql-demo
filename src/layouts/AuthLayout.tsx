import type * as React from 'react';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { APP_CONFIG } from '@/constants/config';

const AuthLayout: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-surface text-text transition-colors duration-300">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[var(--nav-bg)] p-10 text-white lg:flex xl:p-14" aria-labelledby="auth-brand-title">
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(145deg,var(--accent),#f4a68d)] text-lg font-black shadow-lg shadow-black/20">
              {(APP_CONFIG.name || 'Workspace').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nav-muted)]">Workspace</p>
              <p className="font-bold">{APP_CONFIG.name || 'RBAC Platform'}</p>
            </div>
          </div>
        </div>
        <div className="relative max-w-lg">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-hover)]">Trabajo con claridad</p>
          <h1 id="auth-brand-title" className="max-w-md text-4xl font-bold leading-[1.08] tracking-[-0.04em] xl:text-5xl">Todo tu equipo, en el mismo ritmo.</h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-[var(--nav-muted)]">Organiza proyectos, tareas y permisos en un espacio que se siente simple desde el primer día.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {['Proyectos claros', 'Equipos alineados', 'Acceso seguro'].map((label) => (
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.06] px-3.5 py-3 text-xs font-semibold text-white/85" key={label}>
                <span className="h-2 w-2 rounded-full bg-[#6ed3a7] shadow-[0_0_0_4px_rgba(110,211,167,0.12)]" />
                {label}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-[var(--nav-muted)]">Un espacio más humano para hacer mejor trabajo.</p>
      </section>
      <main className="relative flex min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
      <div
        className="w-full max-w-[450px]"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-sm font-black text-white">
            {(APP_CONFIG.name || 'Workspace').slice(0, 1).toUpperCase()}
          </div>
          <p className="font-bold text-text">{APP_CONFIG.name || 'RBAC Platform'}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-surface-card/90 p-6 shadow-[0_24px_70px_rgba(24,44,65,0.11)] backdrop-blur-xl sm:p-9">
          <Outlet />
        </div>
      </div>
      </main>
    </div>
  );
};

export default AuthLayout;
