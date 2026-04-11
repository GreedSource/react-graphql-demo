import { Chip } from '@mui/material';

interface StatusChipProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusChip({
  active,
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}: StatusChipProps) {
  return (
    <Chip
      label={active ? activeLabel : inactiveLabel}
      color={active ? 'success' : 'default'}
      size="small"
      variant={active ? 'filled' : 'outlined'}
    />
  );
}
