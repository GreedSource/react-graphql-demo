import type * as React from 'react';
import type { ReactNode } from 'react';
import { Button, Tooltip } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { usePermission } from '@/lib/permissions';

interface PermissionActionProps {
  permission: string;
  children: ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  disabledLabel?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  onClick?: ButtonProps['onClick'];
  type?: ButtonProps['type'];
}

export const PermissionAction: React.FC<PermissionActionProps> = ({
  permission,
  children,
  variant = 'outlined',
  disabledLabel = 'No tienes permiso para realizar esta accion en este proyecto',
  startIcon,
  endIcon,
  fullWidth = false,
  onClick,
  type = 'button',
}) => {
  const { can } = usePermission();
  const allowed = can(permission);

  return (
    <Tooltip title={allowed ? permission : disabledLabel}>
      <span className={fullWidth ? 'block w-full' : undefined}>
        <Button
          disabled={!allowed}
          endIcon={endIcon}
          fullWidth={fullWidth}
          size="small"
          startIcon={startIcon}
          onClick={onClick}
          type={type}
          variant={variant}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};
