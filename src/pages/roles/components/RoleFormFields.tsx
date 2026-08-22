import type * as React from 'react';
import { MenuItem, TextField } from '@mui/material';
import type { RoleFormFieldsProps } from '../types';

const RoleFormFields: React.FC<RoleFormFieldsProps> = ({
  formState,
  onChange,
}) => {
  return (
    <>
      <TextField
        label="Nombre"
        value={formState.name}
        onChange={(event) =>
          onChange({ ...formState, name: event.target.value })
        }
        size="small"
        fullWidth
      />
      <TextField
        label="Descripción"
        value={formState.description ?? ''}
        onChange={(event) =>
          onChange({ ...formState, description: event.target.value })
        }
        multiline
        minRows={3}
        size="small"
        fullWidth
      />
      <TextField
        label="Estado"
        select
        value={String(formState.active ?? true)}
        onChange={(event) =>
          onChange({ ...formState, active: event.target.value === 'true' })
        }
        size="small"
        fullWidth
      >
        <MenuItem value="true">Activo</MenuItem>
        <MenuItem value="false">Inactivo</MenuItem>
      </TextField>
    </>
  );
};

export default RoleFormFields;
