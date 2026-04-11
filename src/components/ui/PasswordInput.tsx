import { useState, useMemo } from 'react';
import { TextField, InputAdornment, IconButton, FormHelperText } from '@mui/material';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { validatePassword, getPasswordStrength } from '@/lib/password-validation';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  showValidation?: boolean;
  matchValue?: string;
  fullWidth?: boolean;
}

const strengthConfig = {
  none: { color: '#94a3b8', width: '0%', label: '' },
  weak: { color: '#ef4444', width: '33%', label: 'Debil' },
  medium: { color: '#f59e0b', width: '66%', label: 'Media' },
  strong: { color: '#22c55e', width: '100%', label: 'Fuerte' },
};

export default function PasswordInput({
  label,
  value,
  onChange,
  error,
  showValidation = false,
  matchValue,
  fullWidth = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const validation = useMemo(() => validatePassword(value), [value]);
  const strength = useMemo(() => getPasswordStrength(value), [value]);
  const strengthInfo = strengthConfig[strength];

  const passwordsMatch = matchValue !== undefined
    ? value === matchValue && value.length > 0
    : null;

  const hasValidationErrors = showValidation && value.length > 0 && !validation.isValid;

  return (
    <div className="space-y-2">
      <TextField
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={Boolean(error) || hasValidationErrors}
        helperText={error}
        fullWidth={fullWidth}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                sx={{
                  color: '#94a3b8',
                  transition: 'all 200ms',
                  '&:hover': { color: '#e2e8f0' },
                }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
              {matchValue !== undefined && value.length > 0 && (
                <span className="ml-1 text-base">
                  {passwordsMatch ? (
                    <Check sx={{ color: '#22c55e', fontSize: 18 }} />
                  ) : (
                    <Close sx={{ color: '#ef4444', fontSize: 18 }} />
                  )}
                </span>
              )}
            </InputAdornment>
          ),
          sx: {
            '& .MuiOutlinedInput-root': {
              transition: 'all 200ms',
              '&:hover fieldset': {
                borderColor: validation.isValid ? '#22c55e' : '#38bdf8',
              },
              ...(validation.isValid && {
                '& fieldset': { borderColor: '#22c55e' },
              }),
            },
          },
        }}
        inputProps={{
          autoComplete: 'new-password',
        }}
      />

      {/* Password strength bar */}
      {value.length > 0 && showValidation && (
        <div className="space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: strengthInfo.width,
                backgroundColor: strengthInfo.color,
              }}
            />
          </div>
          {strength !== 'none' && strength !== 'strong' && (
            <p className="text-xs" style={{ color: strengthInfo.color }}>
              Fuerza: {strengthInfo.label}
            </p>
          )}
          {strength === 'strong' && (
            <p className="text-xs text-green-500">Contrasena segura</p>
          )}
        </div>
      )}

      {/* Validation rules checklist */}
      {showValidation && value.length > 0 && !validation.isValid && (
        <div className="space-y-1 rounded-lg bg-slate-900/50 p-3 text-xs">
          <p className="font-medium text-slate-400">Requisitos:</p>
          <div className="space-y-0.5">
            {[
              { met: validation.rules.minLength, label: 'Al menos 8 caracteres' },
              { met: validation.rules.hasUppercase, label: 'Una letra mayuscula' },
              { met: validation.rules.hasLowercase, label: 'Una letra minuscula' },
              { met: validation.rules.hasNumber, label: 'Un numero' },
              { met: validation.rules.hasSpecialChar, label: 'Un caracter especial (@$!%*?&)' },
            ].map((rule) => (
              <div
                key={rule.label}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  rule.met ? 'text-green-400' : 'text-text-muted'
                }`}
              >
                {rule.met ? (
                  <Check sx={{ fontSize: 14 }} />
                ) : (
                  <Close sx={{ fontSize: 14 }} />
                )}
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password match indicator */}
      {matchValue !== undefined && value.length > 0 && (
        <FormHelperText
          error={!passwordsMatch}
          sx={{
            transition: 'all 200ms',
          }}
        >
          {passwordsMatch
            ? 'Las contrasenas coinciden'
            : 'Las contrasenas no coinciden'}
        </FormHelperText>
      )}
    </div>
  );
}
