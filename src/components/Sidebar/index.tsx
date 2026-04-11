import { useState, useRef, useEffect } from 'react';
import { Avatar } from '@mui/material';
import SidebarRoutes from './item';
import { useUserStore } from '@/stores/user.store';
import { APP_CONFIG } from '@/constants/config';

const SIDEBAR_WIDTH = '18rem'; // 72 * 0.25rem
const TRANSITION_DURATION = '300ms';
const TRANSITION_TIMING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const Sidebar = () => {
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-${TRANSITION_DURATION} lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Mobile toggle button */}
      <button
        onClick={isOpen ? closeSidebar : openSidebar}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-900 p-2 text-white shadow-lg transition-all duration-200 hover:bg-slate-800 active:scale-95 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-800 bg-slate-950 p-6 text-white transition-all lg:relative lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: SIDEBAR_WIDTH,
          transitionProperty: 'transform, opacity',
          transitionDuration: isMounted ? TRANSITION_DURATION : '0ms',
          transitionTimingFunction: TRANSITION_TIMING,
        }}
      >
        <div
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(-8px)',
            transition: `all ${TRANSITION_DURATION} ${TRANSITION_TIMING}`,
            transitionDelay: isMounted ? '100ms' : '0ms',
          }}
        >
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-lg font-bold text-sky-300 transition-all duration-200 hover:scale-105 hover:bg-sky-500/30"
            >
              GA
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Control center
              </p>
              <span className="text-xl font-semibold text-white">
                {APP_CONFIG.name || 'GraphQL Admin'}
              </span>
            </div>
          </div>
          <SidebarRoutes />
        </div>

        <div
          className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900"
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'translateY(0)' : 'translateY(8px)',
            transition: `all ${TRANSITION_DURATION} ${TRANSITION_TIMING}`,
            transitionDelay: isMounted ? '200ms' : '0ms',
          }}
        >
          <Avatar
            alt={`${user?.name} ${user?.lastname}`}
            src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
            sx={{ width: 32, height: 32 }}
            className="transition-transform duration-200 hover:scale-110"
          />
          <div>
            <p className="text-sm font-medium">
              {user?.name} {user?.lastname}
            </p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
