import type * as React from 'react';
import { useState, useEffect } from 'react';
import MobileOverlay from './mobile-overlay';
import MobileToggle from './mobile-toggle';
import SidebarHeader from './sidebar-header';
import SidebarFooter from './sidebar-footer';

const SIDEBAR_WIDTH = '17rem';
const TRANSITION_DURATION = '300ms';
const TRANSITION_TIMING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <MobileOverlay
        isOpen={isOpen}
        onClose={closeSidebar}
        transitionDuration={TRANSITION_DURATION}
      />

      <MobileToggle
        isOpen={isOpen}
        onToggle={isOpen ? closeSidebar : openSidebar}
      />

      <aside
        id="main-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-white/[0.08] bg-[var(--nav-bg)] p-3.5 text-[var(--nav-text)] shadow-2xl transition-all lg:relative lg:z-auto lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: SIDEBAR_WIDTH,
          backgroundImage: 'radial-gradient(circle at 15% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 18rem), linear-gradient(180deg, var(--nav-bg), color-mix(in srgb, var(--nav-bg) 92%, #091321))',
          transitionProperty: 'transform, opacity',
          transitionDuration: isMounted ? TRANSITION_DURATION : '0ms',
          transitionTimingFunction: TRANSITION_TIMING,
        }}
      >
        <SidebarHeader
          isMounted={isMounted}
          transitionDuration={TRANSITION_DURATION}
          transitionTiming={TRANSITION_TIMING}
        />
        <SidebarFooter
          isMounted={isMounted}
          transitionDuration={TRANSITION_DURATION}
          transitionTiming={TRANSITION_TIMING}
        />
      </aside>
    </>
  );
};

export default Sidebar;
