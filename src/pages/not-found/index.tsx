import * as React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="workspace-card max-w-xl p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Error 404
        </p>
        <h1 className="mt-4 text-5xl font-semibold">Ruta no encontrada</h1>
        <p className="mt-4 text-sm text-text-secondary">
          La pagina que buscas no existe o fue movida dentro del panel
          administrativo.
        </p>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 4 }}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};
