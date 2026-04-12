import { MenuItem, TextField } from '@mui/material';
import type { UpdateUserInput } from '@/types/admin';

interface UserFormFieldsProps {
  formState: UpdateUserInput;
  formErrors: Partial<Record<'name' | 'lastname', string>>;
  roles: Array<{ id: string; name: string }>;
  onChange: (state: UpdateUserInput) => void;
}

export default function UserFormFields({
  formState,
  formErrors,
  roles,
  onChange,
}: UserFormFieldsProps) {
  return (
    <>
      <TextField
        label="Nombre"
        value={formState.name ?? ''}
        onChange={(event) => onChange({ ...formState, name: event.target.value })}
        error={Boolean(formErrors.name)}
        helperText={formErrors.name}
        size="small"
        fullWidth
      />
      <TextField
        label="Apellido"
        value={formState.lastname ?? ''}
        onChange={(event) => onChange({ ...formState, lastname: event.target.value })}
        error={Boolean(formErrors.lastname)}
        helperText={formErrors.lastname}
        size="small"
        fullWidth
      />
      <TextField
        label="Rol"
        value={formState.roleId ?? ''}
        onChange={(event) => onChange({ ...formState, roleId: event.target.value })}
        select
        size="small"
        fullWidth
      >
        <MenuItem value="">Sin rol</MenuItem>
        {roles.map((role) => (
          <MenuItem key={role.id} value={role.id}>
            {role.name}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}
