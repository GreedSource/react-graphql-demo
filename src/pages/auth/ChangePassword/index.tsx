import * as React from 'react';
import { Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ChangePasswordContent: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
          Proximo flujo
        </p>
        <h2 className="text-3xl font-semibold text-text">
          Cambio de contrasena
        </h2>
      </div>
      <Alert severity="info">
        El backend actual no expone aun un mutation para cambio de contrasena.
        La pantalla queda reservada para conectar ese flujo cuando el endpoint
        este disponible.
      </Alert>
      <Button component={Link} to="/login" variant="contained" fullWidth>
        Volver al acceso
      </Button>
    </div>
  );
};

export default ChangePasswordContent;
