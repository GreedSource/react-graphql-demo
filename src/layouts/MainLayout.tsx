import type * as React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PageTransition from '../components/ui/PageTransition';

const MainLayout: React.FC = () => {
  return (
    <div className="app-surface flex h-screen text-text transition-colors duration-300">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
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
