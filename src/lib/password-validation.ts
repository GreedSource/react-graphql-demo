/**
 * Password validation rules (matching backend):
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  };

  const errors: string[] = [];

  if (!rules.minLength) {
    errors.push('Al menos 8 caracteres');
  }
  if (!rules.hasUppercase) {
    errors.push('Una letra mayuscula');
  }
  if (!rules.hasLowercase) {
    errors.push('Una letra minuscula');
  }
  if (!rules.hasNumber) {
    errors.push('Un numero');
  }
  if (!rules.hasSpecialChar) {
    errors.push('Un caracter especial (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    rules,
  };
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'none' {
  if (!password) return 'none';
  const { rules } = validatePassword(password);
  const score = [rules.minLength, rules.hasUppercase, rules.hasLowercase, rules.hasNumber, rules.hasSpecialChar].filter(Boolean).length;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}
