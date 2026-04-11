import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, CircularProgress, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuthActions } from '@/hooks/auth.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { isValidEmail } from '@/lib/validation';

export default function RecoverPassword() {
  const { recoverPassword, recoverPasswordState } = useAuthActions();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitError = useMemo(() => {
    return recoverPasswordState.error
      ? getApolloErrorMessage(recoverPasswordState.error)
      : null;
  }, [recoverPasswordState.error]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setError('Ingresa un correo valido.');
      return;
    }

    setError(null);

    try {
      const response = await recoverPassword(email);
      toast.success(response.message || 'Solicitud enviada correctamente.');
      setEmail('');
    } catch (submitError) {
      toast.error(getApolloErrorMessage(submitError));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
          Recuperacion
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Recuperar contrasena</h2>
        <p className="text-sm text-slate-500">
          Te enviaremos los siguientes pasos al correo registrado.
        </p>
      </div>

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <TextField
        label="Correo electronico"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={Boolean(error)}
        helperText={error}
        fullWidth
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={recoverPasswordState.loading}
      >
        {recoverPasswordState.loading ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          'Enviar instrucciones'
        )}
      </Button>

      <p className="text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-sky-700 hover:text-sky-900">
          Volver al login
        </Link>
      </p>
    </form>
  );
}
