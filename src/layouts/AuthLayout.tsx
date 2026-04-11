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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface-elevated to-surface px-4 py-12 transition-colors duration-300">
      <div
        className="w-full max-w-md"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="rounded-3xl border border-border bg-surface-card/80 p-8 shadow-xl backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
