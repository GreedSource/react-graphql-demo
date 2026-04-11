import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function AuthLayout() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-12">
      <div
        className="w-full max-w-md"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
