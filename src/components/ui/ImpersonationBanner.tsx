import type * as React from 'react';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import { useAuthActions } from '@/hooks/auth.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { useUserStore } from '@/stores/user.store';

const ImpersonationBanner: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const impersonation = useUserStore((state) => state.impersonation);
  const { stopImpersonation, stopImpersonationState } = useAuthActions();

  if (!impersonation || !user) {
    return null;
  }

  const userName = `${user.name} ${user.lastname}`.trim();

  const handleReturn = async () => {
    try {
      await stopImpersonation();
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-amber-300/70 bg-amber-50 px-4 py-2.5 text-amber-950 dark:border-amber-700/70 dark:bg-amber-950/70 dark:text-amber-50 sm:px-6 lg:px-10"
    >
      <div className="flex min-w-0 items-center gap-3">
        <SecurityRounded aria-hidden="true" fontSize="small" />
        <p className="min-w-0 text-sm leading-5">
          <strong>Impersonación activa:</strong>{' '}
          estás viendo a <strong>{userName}</strong> ({user.email}) con sus
          permisos y asignaciones.
        </p>
      </div>
      <Button
        color="inherit"
        variant="outlined"
        size="small"
        startIcon={<ArrowBackRounded aria-hidden="true" />}
        disabled={stopImpersonationState.loading}
        onClick={() => void handleReturn()}
        sx={{
          minHeight: 40,
          borderColor: 'currentColor',
          color: 'inherit',
          '&:hover': { borderColor: 'currentColor', bgcolor: 'rgba(120, 80, 0, 0.08)' },
        }}
      >
        {stopImpersonationState.loading ? 'Regresando...' : 'Regresar a mi cuenta'}
      </Button>
    </div>
  );
};

export default ImpersonationBanner;
