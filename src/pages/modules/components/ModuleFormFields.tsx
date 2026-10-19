import type * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { slugifyKey } from '@/lib/validation';
import type { ModuleFormFieldsProps } from '../types';

const ModuleFormFields: React.FC<ModuleFormFieldsProps> = ({
  formState,
  dialogMode,
  onChange,
}) => {
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
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-elevated/50 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">Estado del módulo</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Actívalo para que esté disponible al asignar permisos.
          </p>
        </div>
        <FormControlLabel
          label={formState.active ? 'Activo' : 'Inactivo'}
          labelPlacement="start"
          control={
            <Switch
              checked={formState.active ?? true}
              onChange={(event) =>
                onChange({ ...formState, active: event.target.checked })
              }
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'var(--accent)',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'var(--accent)',
                  opacity: 1,
                },
                '& .MuiSwitch-track': {
                  backgroundColor: 'var(--text-muted)',
                  opacity: 0.45,
                },
                '& .MuiSwitch-thumb': {
                  boxShadow: '0 1px 3px rgb(0 0 0 / 18%)',
                },
                '& .MuiSwitch-switchBase.Mui-focusVisible .MuiSwitch-thumb': {
                  outline: '2px solid var(--accent)',
                  outlineOffset: 2,
                },
              }}
            />
          }
          sx={{
            m: 0,
            gap: 0.5,
            flexShrink: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            },
          }}
        />
      </div>
    </>
  );
};

export default ModuleFormFields;
