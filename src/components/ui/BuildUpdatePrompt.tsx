import type * as React from 'react';
import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { checkForNewBuild } from '@/lib/build-version';

const BUILD_CHECK_INTERVAL = 5 * 60 * 1000;

const BuildUpdatePrompt: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let disposed = false;

    const checkBuild = async () => {
      const hasNewBuild = await checkForNewBuild();

      if (hasNewBuild && !disposed) {
        setUpdateAvailable(true);
      }
    };

    const handleWindowFocus = () => {
      void checkBuild();
    };

    void checkBuild();
    const intervalId = window.setInterval(
      () => void checkBuild(),
      BUILD_CHECK_INTERVAL,
    );
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return (
    <Snackbar
      open={updateAvailable}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ width: 'min(calc(100% - 32px), 520px)' }}
    >
      <Alert
        severity="info"
        variant="filled"
        role="status"
        sx={{ width: '100%', alignItems: 'center' }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => window.location.reload()}
            sx={{ minHeight: 44, whiteSpace: 'nowrap' }}
          >
            Actualizar
          </Button>
        }
      >
        Hay una nueva versión disponible.
      </Alert>
    </Snackbar>
  );
};

export default BuildUpdatePrompt;
