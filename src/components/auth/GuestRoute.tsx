import { Outlet } from 'react-router-dom';
import { useGuestBootstrap } from '@/hooks/auth.hook';

export function GuestRoute() {
  const { isReady } = useGuestBootstrap();

  // For guests without a token, resolve immediately — no loading spinner.
  if (!isReady) {
    return null;
  }

  return <Outlet />;
}
