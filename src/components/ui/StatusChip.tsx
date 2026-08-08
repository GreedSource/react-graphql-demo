import type * as React from 'react';
import { Chip } from '@mui/material';

interface StatusChipProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  active,
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}) => {
  return (
    <Chip
      label={active ? activeLabel : inactiveLabel}
      color={active ? 'success' : 'default'}
      size="small"
      variant={active ? 'filled' : 'outlined'}
    />
  );
};
