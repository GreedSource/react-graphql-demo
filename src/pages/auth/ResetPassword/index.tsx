import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuthActions } from '@/hooks/auth.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { validatePassword } from '@/lib/password-validation';
import PasswordInput from '@/components/ui/PasswordInput';
import type { ResetPasswordInput } from '@/types/admin';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { resetPassword, resetPasswordState } = useAuthActions();
  const [formState, setFormState] = useState<ResetPasswordInput>({
    token: token ?? '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordInput, string>>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (token) {
      setFormState((current) => ({ ...current, token }));
    }
  }, [token]);

  const submitError = useMemo(() => {
    return resetPasswordState.error
      ? getApolloErrorMessage(resetPasswordState.error)
      : null;
  }, [resetPasswordState.error]);

  const handleChange = (field: keyof ResetPasswordInput, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof ResetPasswordInput, string>> = {};

    const passwordValidation = validatePassword(formState.password);
    if (!passwordValidation.isValid) {
      nextErrors.password = passwordValidation.errors.join(', ');
    }
    if (formState.password !== formState.confirmPassword) {
      nextErrors.confirmPassword = 'Las contrasenas no coinciden.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    const passwordValidation = validatePassword(formState.password);
    return (
      passwordValidation.isValid &&
      formState.password === formState.confirmPassword &&
      formState.confirmPassword.length > 0
    );
  }, [formState]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      const response = await resetPassword(formState);
      toast.success(response.message || 'Contrasena restablecida correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div
        className="space-y-3 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Restablecer
        </p>
        <h2 className="text-3xl font-semibold text-text">Nueva contrasena</h2>
        <p className="text-sm text-text-secondary">
          Ingresa tu nueva contrasena para continuar.
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
        <PasswordInput
          label="Nueva contrasena"
          value={formState.password}
          onChange={(value) => handleChange('password', value)}
          error={errors.password}
          showValidation
        />
      </div>

      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '300ms' : '0ms',
        }}
      >
        <PasswordInput
          label="Confirmar contrasena"
          value={formState.confirmPassword}
          onChange={(value) => handleChange('confirmPassword', value)}
          error={errors.confirmPassword}
          matchValue={formState.password}
        />
      </div>

      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '350ms' : '0ms',
        }}
      >
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={resetPasswordState.loading || !isFormValid}
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
          {resetPasswordState.loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            'Restablecer contrasena'
          )}
        </Button>
      </div>

      <p
        className="text-center text-sm text-text-secondary"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: isVisible ? '400ms' : '0ms',
        }}
      >
        <Link
          to="/login"
          className="font-medium text-accent transition-all duration-200 hover:text-accent-hover hover:underline"
        >
          Volver al login
        </Link>
      </p>
    </form>
  );
}
