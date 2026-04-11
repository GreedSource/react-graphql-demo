import { useMemo, useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

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
    <form className="space-y-10" onSubmit={handleSubmit}>
      <div
        className="space-y-3 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
          Recuperacion
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Recuperar contrasena</h2>
        <p className="text-sm text-slate-500">
          Te enviaremos los siguientes pasos al correo registrado.
        </p>
      </div>

      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '100ms' : '0ms',
        }}
      >
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
      </div>

      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '200ms' : '0ms',
        }}
      >
        <TextField
          label="Correo electronico"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(error)}
          helperText={error}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              transition: 'all 200ms',
              '&:hover fieldset': {
                borderColor: 'sky.500',
              },
            },
          }}
        />
      </div>

      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '300ms' : '0ms',
        }}
      >
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={recoverPasswordState.loading}
          sx={{
            transition: 'all 200ms',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {recoverPasswordState.loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            'Enviar instrucciones'
          )}
        </Button>
      </div>

      <p
        className="text-center text-sm text-slate-600"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '400ms' : '0ms',
        }}
      >
        <Link
          to="/login"
          className="font-medium text-sky-700 transition-all duration-200 hover:text-sky-900 hover:underline"
        >
          Volver al login
        </Link>
      </p>
    </form>
  );
}
