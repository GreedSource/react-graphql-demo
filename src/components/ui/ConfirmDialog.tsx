import type * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import { toast } from 'react-toastify';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  destructive?: boolean;
  loading?: boolean;
}

interface PendingDeleteToastProps {
  onUndo: () => void;
}

const PendingDeleteToast: React.FC<PendingDeleteToastProps> = ({ onUndo }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      color: '#ffffff',
    }}
  >
    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
      Eliminación pendiente
    </span>
    <button
      type="button"
      aria-label="Deshacer eliminación"
      style={{
        border: 0,
        borderRadius: 7,
        padding: '7px 11px',
        background: '#fbbf24',
        color: '#172033',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
      onClick={onUndo}
    >
      DESHACER
    </button>
  </div>
);

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onClose,
  onConfirm,
  destructive = false,
  loading = false,
}) => {
  const [phase, setPhase] = useState<'idle' | 'holding'>('idle');
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastId = useRef<ReturnType<typeof toast> | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setProgress(0);
    }
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [open]);

  const cancelTimers = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = null;
  };

  const cancelHold = () => {
    if (phase !== 'holding') return;
    cancelTimers();
    setPhase('idle');
    setProgress(0);
  };

  const startHold = () => {
    if (loading || phase !== 'idle') return;
    setPhase('holding');
    setProgress(8);
    const startedAt = Date.now();
    holdTimer.current = setTimeout(() => {
      cancelTimers();
      setProgress(100);
      onClose();
      const cancelPending = () => {
        if (commitTimer.current) clearTimeout(commitTimer.current);
        commitTimer.current = null;
        if (toastId.current) {
          toast.dismiss(toastId.current);
          toastId.current = null;
        }
      };
      toastId.current = toast(
        ({ closeToast }) => (
          <PendingDeleteToast
            onUndo={() => {
              cancelPending();
              closeToast?.();
            }}
          />
        ),
        {
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          className: 'pending-delete-toast',
          style: {
            background: '#172033',
            color: '#ffffff',
            minWidth: 310,
          },
        },
      );
      commitTimer.current = setTimeout(() => {
        commitTimer.current = null;
        if (toastId.current) toast.dismiss(toastId.current);
        toastId.current = null;
        onConfirm();
      }, 2200);
    }, 900);
    progressTimer.current = setInterval(() => {
      setProgress(
        Math.min(96, Math.round(((Date.now() - startedAt) / 900) * 100)),
      );
    }, 50);
  };

  const handleClose = () => {
    cancelTimers();
    setPhase('idle');
    setProgress(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <p className="text-sm text-text-secondary">{description}</p>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onPointerDown={destructive ? startHold : onConfirm}
          onPointerUp={destructive ? cancelHold : undefined}
          onPointerLeave={destructive ? cancelHold : undefined}
          onPointerCancel={destructive ? cancelHold : undefined}
          onContextMenu={(event) => {
            if (destructive) event.preventDefault();
          }}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={loading}
          sx={{
            minWidth: destructive ? 150 : undefined,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {destructive && phase === 'holding'
            ? 'Mantén presionado…'
            : destructive
              ? 'Mantén para eliminar'
              : confirmLabel}
          {destructive && phase === 'holding' ? (
            <LinearProgress
              variant="determinate"
              value={progress}
              color="inherit"
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.28,
              }}
            />
          ) : null}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
