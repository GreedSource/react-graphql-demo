import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="max-w-xl rounded-[32px] border border-white/10 bg-white/10 p-10 text-center text-white backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
          Error 404
        </p>
        <h1 className="mt-4 text-5xl font-semibold">Ruta no encontrada</h1>
        <p className="mt-4 text-sm text-slate-200">
          La pagina que buscas no existe o fue movida dentro del panel
          administrativo.
        </p>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 4 }}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
