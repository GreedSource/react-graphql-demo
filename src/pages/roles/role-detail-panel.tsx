import { Button, Chip, MenuItem, TextField } from '@mui/material';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatRolePermissionLabel } from '@/lib/graphql';
import type { Role } from '@/types/admin';

interface RoleDetailPanelProps {
  selectedRole: Role | undefined;
  permissions: Array<{
    id: string;
    moduleKey: string;
    actionKey: string;
    description?: string | null;
  }>;
  assignedPermissions: Array<{
    id: string;
    moduleKey: string;
    actionKey: string;
    description?: string | null;
  }>;
  availablePermissions: Array<{
    id: string;
    moduleKey: string;
    actionKey: string;
    description?: string | null;
  }>;
  assignIds: string[];
  removeIds: string[];
  onAssignIdsChange: (ids: string[]) => void;
  onRemoveIdsChange: (ids: string[]) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAssignPermissions: () => void;
  onRemovePermissions: () => void;
  addPermissionsLoading: boolean;
  removePermissionsLoading: boolean;
}

export default function RoleDetailPanel({
  selectedRole,
  assignedPermissions,
  availablePermissions,
  assignIds,
  removeIds,
  onAssignIdsChange,
  onRemoveIdsChange,
  onEdit,
  onDelete,
  onAssignPermissions,
  onRemovePermissions,
  addPermissionsLoading,
  removePermissionsLoading,
}: RoleDetailPanelProps) {
  const normalizeMultiValue = (value: string | string[]) => {
    return Array.isArray(value) ? value : value.split(',');
  };

  if (!selectedRole) {
    return (
      <StateCard
        title="Sin seleccion"
        description="Selecciona un rol para ver su detalle."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-text">
            {selectedRole.name}
          </h3>
          <StatusChip active={selectedRole.active} />
        </div>
        <p className="text-sm text-text-secondary">
          {selectedRole.description || 'Este rol no tiene descripcion.'}
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="contained" onClick={onEdit}>
          Editar
        </Button>
        <Button color="error" variant="outlined" onClick={onDelete}>
          Eliminar
        </Button>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text">
          Permisos actuales
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedRole.permissions.length ? (
            selectedRole.permissions.map((permission) => (
              <Chip
                key={formatRolePermissionLabel(
                  permission.type,
                  permission.action,
                )}
                label={formatRolePermissionLabel(
                  permission.type,
                  permission.action,
                )}
                variant="outlined"
                color="info"
              />
            ))
          ) : (
            <p className="text-sm text-text-muted">
              No hay permisos asignados.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <TextField
          select
          SelectProps={{ multiple: true }}
          value={assignIds}
          onChange={(event) =>
            onAssignIdsChange(normalizeMultiValue(event.target.value))
          }
          label="Asignar permisos"
          helperText="Selecciona permisos disponibles para agregarlos al rol."
          fullWidth
        >
          {availablePermissions.map((permission) => (
            <MenuItem key={permission.id} value={permission.id}>
              {permission.description || permission.id}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          onClick={() => void onAssignPermissions()}
          disabled={!assignIds.length || addPermissionsLoading}
        >
          Asignar permisos
        </Button>

        <TextField
          select
          SelectProps={{ multiple: true }}
          value={removeIds}
          onChange={(event) =>
            onRemoveIdsChange(normalizeMultiValue(event.target.value))
          }
          label="Remover permisos"
          helperText="Selecciona permisos ya asignados para removerlos del rol."
          fullWidth
        >
          {assignedPermissions.map((permission) => (
            <MenuItem key={permission.id} value={permission.id}>
              {permission.description || permission.id}
            </MenuItem>
          ))}
        </TextField>
        <Button
          color="error"
          variant="outlined"
          onClick={() => void onRemovePermissions()}
          disabled={!removeIds.length || removePermissionsLoading}
        >
          Remover permisos
        </Button>
      </div>
    </div>
  );
}
