import type * as React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PageTransition from '../components/ui/PageTransition';

const MainLayout: React.FC = () => {
  return (
    <div className="app-surface flex h-screen min-h-dvh text-text transition-colors duration-300">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="main-scroll-area min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto h-full min-h-full w-full max-w-[1480px] px-4 py-5 sm:px-7 sm:py-6 lg:px-10 lg:py-8">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
