import type * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { UserFormFieldsProps } from '../types';

const UserFormFields: React.FC<UserFormFieldsProps> = ({
  formState,
  formErrors,
  roles,
  roleDisabled,
  roleHelperText,
  onChange,
}) => {
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
        label="Correo electrónico"
        value={formState.email}
        disabled
        size="small"
        fullWidth
        helperText="El correo electrónico no se puede editar."
      />
      {roleDisabled ? (
        <TextField
          label="Rol actual"
          value={formState.roleName || 'Sin rol asignado'}
          disabled
          size="small"
          fullWidth
          helperText={roleHelperText}
        />
      ) : (
        <TextField
          label="Rol"
          value={formState.roleId}
          onChange={(event) => onChange({ ...formState, roleId: event.target.value })}
          select
          size="small"
          fullWidth
          helperText={roleHelperText}
        >
          <MenuItem value="">Sin rol</MenuItem>
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
};

export default UserFormFields;
