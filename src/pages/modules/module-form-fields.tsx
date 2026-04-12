import { MenuItem, TextField } from '@mui/material';
import { slugifyKey } from '@/lib/validation';
import type { CreateModuleInput } from '@/types/admin';

interface ModuleFormFieldsProps {
  formState: CreateModuleInput & { id?: string };
  dialogMode: 'create' | 'edit';
  onChange: (state: CreateModuleInput & { id?: string }) => void;
}

export default function ModuleFormFields({
  formState,
  dialogMode,
  onChange,
}: ModuleFormFieldsProps) {
  return (
    <>
      <TextField
        label="Nombre"
        value={formState.name}
        onChange={(event) => {
          const name = event.target.value;
          onChange({
            ...formState,
            name,
            key: dialogMode === 'create' ? slugifyKey(name) : formState.key,
          });
        }}
        size="small"
        fullWidth
      />
      <TextField
        label="Key"
        value={formState.key}
        onChange={(event) =>
          onChange({ ...formState, key: slugifyKey(event.target.value) })
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
