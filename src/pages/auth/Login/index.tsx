import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, CircularProgress, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuthActions } from '@/hooks/auth.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { isValidEmail } from '@/lib/validation';

interface LoginFormState {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginState } = useAuthActions();
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormState>>({});

  const submitError = useMemo(() => {
    return loginState.error ? getApolloErrorMessage(loginState.error) : null;
  }, [loginState.error]);

  const handleChange = (field: keyof LoginFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<LoginFormState> = {};

    if (!isValidEmail(formState.email)) {
      nextErrors.email = 'Ingresa un correo valido.';
    }

    if (!formState.password.trim()) {
      nextErrors.password = 'La contrasena es obligatoria.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const response = await login(formState);
      toast.success(response.message || 'Sesion iniciada correctamente.');
      const nextPath = location.state?.from?.pathname || '/';
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
          Acceso seguro
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Iniciar sesion</h2>
        <p className="text-sm text-slate-500">
          Entra al panel para administrar usuarios, roles y permisos.
        </p>
      </div>

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <TextField
        label="Correo electronico"
        type="email"
        value={formState.email}
        onChange={(event) => handleChange('email', event.target.value)}
        error={Boolean(errors.email)}
        helperText={errors.email}
        fullWidth
      />
      <TextField
        label="Contrasena"
        type="password"
        value={formState.password}
        onChange={(event) => handleChange('password', event.target.value)}
        error={Boolean(errors.password)}
        helperText={errors.password}
        fullWidth
      />

      <Button type="submit" fullWidth variant="contained" disabled={loginState.loading}>
        {loginState.loading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
      </Button>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <Link to="/register" className="font-medium text-sky-700 hover:text-sky-900">
          Crear cuenta
        </Link>
        <Link
          to="/recover-password"
          className="font-medium text-slate-500 hover:text-slate-800"
        >
          Olvide mi contrasena
        </Link>
      </div>
    </form>
  );
}
