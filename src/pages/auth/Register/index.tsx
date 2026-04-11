import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, CircularProgress, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuthActions } from '@/hooks/auth.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { isValidEmail } from '@/lib/validation';
import type { RegisterInput } from '@/types/admin';

export default function Register() {
  const navigate = useNavigate();
  const { register, registerState } = useAuthActions();
  const [formState, setFormState] = useState<RegisterInput>({
    name: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});

  const submitError = useMemo(() => {
    return registerState.error ? getApolloErrorMessage(registerState.error) : null;
  }, [registerState.error]);

  const handleChange = (field: keyof RegisterInput, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof RegisterInput, string>> = {};

    if (!formState.name.trim()) nextErrors.name = 'El nombre es obligatorio.';
    if (!formState.lastname.trim()) nextErrors.lastname = 'El apellido es obligatorio.';
    if (!isValidEmail(formState.email)) nextErrors.email = 'Ingresa un correo valido.';
    if (formState.password.length < 8) {
      nextErrors.password = 'Usa al menos 8 caracteres.';
    }
    if (formState.password !== formState.confirmPassword) {
      nextErrors.confirmPassword = 'Las contrasenas no coinciden.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      const response = await register(formState);
      toast.success(response.message || 'Cuenta creada correctamente.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
          Nuevo acceso
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Crear cuenta</h2>
        <p className="text-sm text-slate-500">
          Registra un usuario inicial para entrar al panel administrativo.
        </p>
      </div>

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre"
          value={formState.name}
          onChange={(event) => handleChange('name', event.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          fullWidth
        />
        <TextField
          label="Apellido"
          value={formState.lastname}
          onChange={(event) => handleChange('lastname', event.target.value)}
          error={Boolean(errors.lastname)}
          helperText={errors.lastname}
          fullWidth
        />
      </div>
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
      <TextField
        label="Confirmar contrasena"
        type="password"
        value={formState.confirmPassword}
        onChange={(event) => handleChange('confirmPassword', event.target.value)}
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword}
        fullWidth
      />

      <Button type="submit" fullWidth variant="contained" disabled={registerState.loading}>
        {registerState.loading ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          'Crear cuenta'
        )}
      </Button>

      <p className="text-center text-sm text-slate-600">
        ¿Ya tienes acceso?{' '}
        <Link to="/login" className="font-medium text-sky-700 hover:text-sky-900">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
