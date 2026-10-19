import type * as React from 'react';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { PermissionCardProps } from '../types';

const PermissionCard: React.FC<PermissionCardProps> = ({ permission, onDelete }) => {
  return (
    <article className="group flex min-h-[172px] flex-col justify-between rounded-2xl border border-border bg-surface-card p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_14px_28px_rgba(24,44,65,0.08)] dark:hover:shadow-black/20">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex max-w-[calc(100%-40px)] truncate rounded-lg bg-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-accent">
            {permission.moduleKey}
          </span>
          <Tooltip title="Eliminar permiso">
            <IconButton
              size="small"
              aria-label={`Eliminar permiso ${permission.moduleKey}:${permission.actionKey}`}
              onClick={() => onDelete(permission)}
              className="shrink-0"
              sx={{ color: 'var(--text-muted)' }}
            >
              <DeleteOutlineRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <h3 className="mt-4 break-words text-lg font-bold tracking-tight text-text">
          {permission.actionKey}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">
          {permission.description || 'Sin descripción para este permiso.'}
        </p>
      </div>
      <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-text-muted">
        {permission.moduleKey}:{permission.actionKey}
      </p>
    </article>
  );
};

export default PermissionCard;
