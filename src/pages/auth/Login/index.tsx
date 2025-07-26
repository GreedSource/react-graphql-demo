import { useLogin } from '@/hooks/user.hook';
import { useUserStore } from '@/stores/user.store';
import { TextField, Button, CircularProgress } from '@mui/material';
import { useState } from 'react';

interface LoginInterface {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
}

const Login = () => {
  const { setAccessToken, setRefreshToken, setUser } = useUserStore();
  // Estado loading
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<LoginInterface>({
    password: '',
    email: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const { login } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error al escribir
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); // Activa loader
    // Aquí puedes manejar el submit (validación, API, etc)
    try {
      const res = await login({
        variables: formState,
      });
      setAccessToken(res.data.login.accessToken);
      setRefreshToken(res.data.login.refreshToken);
      setUser(res.data.login.user);
      setFormState({ email: '', password: '' });
    } finally {
      setLoading(false); // Desactiva loader
    }
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!formState.email.trim()) {
      newErrors.email = 'El usuario es requerido';
    }
    if (!formState.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center">Login</h2>
      <TextField
        value={formState.email}
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
      />
      <TextField
        value={formState.password}
        label="Contraseña"
        type="password"
        name="password"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password}
        onChange={handleChange}
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
      </Button>
    </form>
  );
};

export default Login;
