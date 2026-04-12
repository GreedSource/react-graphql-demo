import { useState, useEffect } from 'react';
import MobileOverlay from './mobile-overlay';
import MobileToggle from './mobile-toggle';
import SidebarHeader from './sidebar-header';
import SidebarFooter from './sidebar-footer';

const SIDEBAR_WIDTH = '18rem';
const TRANSITION_DURATION = '300ms';
const TRANSITION_TIMING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const Sidebar = () => {
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white p-6 transition-all lg:relative lg:z-auto lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: SIDEBAR_WIDTH,
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
