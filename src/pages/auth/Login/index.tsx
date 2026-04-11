import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, CircularProgress, TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

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
      <div
        className="space-y-2 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
          Acceso seguro
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Iniciar sesion</h2>
        <p className="text-sm text-slate-500">
          Entra al panel para administrar usuarios, roles y permisos.
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
          transitionDelay: isVisible ? '150ms' : '0ms',
        }}
      >
        <TextField
          label="Correo electronico"
          type="email"
          value={formState.email}
          onChange={(event) => handleChange('email', event.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
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
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '200ms' : '0ms',
        }}
      >
        <TextField
          label="Contrasena"
          type={showPassword ? 'text' : 'password'}
          value={formState.password}
          onChange={(event) => handleChange('password', event.target.value)}
          error={Boolean(errors.password)}
          helperText={errors.password}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  tabIndex={-1}
                  sx={{
                    color: '#94a3b8',
                    transition: 'all 200ms',
                    '&:hover': { color: '#e2e8f0' },
                  }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          inputProps={{
            autoComplete: 'current-password',
          }}
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
          transitionDelay: isVisible ? '250ms' : '0ms',
        }}
      >
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loginState.loading}
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
          {loginState.loading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
        </Button>
      </div>

      <div
        className="flex items-center justify-between text-sm text-slate-600"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '300ms' : '0ms',
        }}
      >
        <Link
          to="/register"
          className="font-medium text-sky-700 transition-all duration-200 hover:text-sky-900 hover:underline"
        >
          Crear cuenta
        </Link>
        <Link
          to="/recover-password"
          className="font-medium text-slate-500 transition-all duration-200 hover:text-slate-800 hover:underline"
        >
          Olvide mi contrasena
        </Link>
      </div>
    </form>
  );
}
