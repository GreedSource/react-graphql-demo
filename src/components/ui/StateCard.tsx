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

export function StateCard({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  loading = false,
}: StateCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-surface-card/90 p-6 shadow-sm transition-colors duration-300">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-text">
          {loading ? <CircularProgress size={20} color="inherit" /> : icon}
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
          {actionLabel && onAction ? (
            <Button variant="outlined" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
