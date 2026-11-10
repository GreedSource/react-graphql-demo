import type * as React from 'react';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PageTransition from '../components/ui/PageTransition';
import ImpersonationBanner from '../components/ui/ImpersonationBanner';

const MainContentFallback: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center">
      <CircularProgress size={30} sx={{ color: 'var(--accent)' }} />
    </div>
  );
};

const MainLayout: React.FC = () => {
  return (
    <div className="app-surface flex h-screen min-h-dvh text-text transition-colors duration-300">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ImpersonationBanner />
        <Navbar />
        <main className="main-scroll-area min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto min-h-full w-full max-w-[1920px] px-4 pt-5 pb-12 sm:px-7 sm:pt-6 sm:pb-14 lg:px-10 lg:pt-8 lg:pb-16">
            <Suspense fallback={<MainContentFallback />}>
              <PageTransition>
                <Outlet />
              </PageTransition>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
