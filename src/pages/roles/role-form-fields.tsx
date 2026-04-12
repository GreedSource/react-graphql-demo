import { MenuItem, TextField } from '@mui/material';
import type { CreateRoleInput } from '@/types/admin';

interface RoleFormFieldsProps {
  formState: CreateRoleInput & { id?: string };
  onChange: (state: CreateRoleInput & { id?: string }) => void;
}

export default function RoleFormFields({
  formState,
  onChange,
}: RoleFormFieldsProps) {
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
        label="Descripcion"
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
}
