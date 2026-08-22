import type * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from '@mui/material';
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
  const [phase, setPhase] = useState<'idle' | 'holding' | 'arming' | 'loading'>('idle');
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastId = useRef<ReturnType<typeof toast> | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setProgress(0);
    }
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [open]);

  useEffect(() => {
    if (loading) setPhase('loading');
  }, [loading]);

  const cancelTimers = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    countdownTimer.current = null;
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
        if (toastId.current) toast.dismiss(toastId.current);
      };
      toastId.current = toast(({ closeToast }) => <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', color: '#ffffff' }}><span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#ffffff' }}>Eliminación pendiente</span><button type="button" aria-label="Deshacer eliminación" style={{ border: 0, borderRadius: 7, padding: '7px 11px', background: '#fbbf24', color: '#172033', cursor: 'pointer', fontSize: 12, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap' }} onClick={() => { cancelPending(); closeToast?.(); }}>DESHACER</button></div>, { autoClose: false, closeButton: false, closeOnClick: false, className: 'pending-delete-toast', style: { background: '#172033', color: '#ffffff', minWidth: 310 } });
      commitTimer.current = setTimeout(() => {
        commitTimer.current = null;
        if (toastId.current) toast.dismiss(toastId.current);
        toastId.current = null;
        onConfirm();
      }, 2200);
    }, 900);
    const progressTimer = setInterval(() => {
      setProgress(Math.min(96, Math.round(((Date.now() - startedAt) / 900) * 100)));
    }, 50);
    setTimeout(() => clearInterval(progressTimer), 950);
  };

  const handleClose = () => {
    cancelTimers();
    setPhase('idle');
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading || phase === 'arming' ? undefined : handleClose} fullWidth maxWidth="xs">
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
          onContextMenu={(event) => { if (destructive) event.preventDefault(); }}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={loading}
          sx={{ minWidth: destructive ? 150 : undefined, position: 'relative', overflow: 'hidden' }}
        >
          {destructive && phase === 'holding' ? 'Mantén presionado…' : destructive ? 'Mantén para eliminar' : confirmLabel}
          {destructive && phase === 'holding' ? <LinearProgress variant="determinate" value={progress} color="inherit" sx={{ position: 'absolute', inset: 0, opacity: 0.28 }} /> : null}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
