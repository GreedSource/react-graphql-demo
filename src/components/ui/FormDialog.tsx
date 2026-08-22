import type * as React from 'react';
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

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  actions,
  maxWidth = 'sm',
}) => {
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
          bgcolor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          boxShadow:
            '0 30px 80px rgba(15, 23, 42, 0.22), 0 8px 24px rgba(15, 23, 42, 0.12)',
          backgroundImage: 'linear-gradient(160deg, color-mix(in srgb, var(--accent) 4%, var(--bg-card)), var(--bg-card) 38%)',
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
          color: 'var(--text-primary)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div className="space-y-1">
          <div>{title}</div>
          {subtitle ? (
            <p className="text-sm font-normal text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
        <div className="grid gap-5 pt-2">{children}</div>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
          '& > *': { flexShrink: 0 },
        }}
      >
        {actions}
      </DialogActions>
    </Dialog>
  );
};
