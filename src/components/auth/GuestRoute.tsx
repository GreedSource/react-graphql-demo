import type * as React from 'react';
import { Outlet } from 'react-router-dom';
import { useGuestBootstrap } from '@/hooks/auth.hook';

export const GuestRoute: React.FC = () => {
  const { isReady } = useGuestBootstrap();

  // For guests without a token, resolve immediately — no loading spinner.
  if (!isReady) {
    return null;
  }

  return <Outlet />;
};
