import type * as React from 'react';
import type { ReactNode } from 'react';
import { Button, Tooltip } from '@mui/material';
import { usePermission } from '@/lib/permissions';

interface PermissionActionProps {
  permission: string;
  children: ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  disabledLabel?: string;
}

export const PermissionAction: React.FC<PermissionActionProps> = ({
  permission,
  children,
  variant = 'outlined',
  disabledLabel = 'No tienes permiso para realizar esta accion en este proyecto',
}) => {
  const { can } = usePermission();
  const allowed = can(permission);

  return (
    <Tooltip title={allowed ? permission : disabledLabel}>
      <span>
        <Button disabled={!allowed} size="small" variant={variant}>
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};
