import type { ReactNode } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

interface FormDialogProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';
}

export function FormDialog({
  open,
  title,
  subtitle,
  onClose,
  children,
  actions,
  maxWidth = 'sm',
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow:
            '0 30px 80px rgba(15, 23, 42, 0.22), 0 8px 24px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: subtitle ? 1 : 2,
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#0f172a',
        }}
      >
        <div className="space-y-1">
          <div>{title}</div>
          {subtitle ? (
            <p className="text-sm font-normal text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 1 }}>
        <div className="grid gap-4 pt-2">{children}</div>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
        }}
      >
        {actions}
      </DialogActions>
    </Dialog>
  );
}
