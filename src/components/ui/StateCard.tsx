import type * as React from 'react';
import type { ReactNode } from 'react';
import { Button, CircularProgress } from '@mui/material';

interface StateCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  loading?: boolean;
}

export const StateCard: React.FC<StateCardProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  loading = false,
}) => {
  return (
    <div className="bg-surface-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase text-text-muted">{description}</p>
          <h3 className="text-3xl font-semibold leading-tight text-text">{title}</h3>
          {actionLabel && onAction ? (
            <Button variant="outlined" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
          {loading ? <CircularProgress size={20} color="inherit" /> : icon}
        </div>
      </div>
    </div>
  );
};
