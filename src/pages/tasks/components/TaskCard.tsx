import type * as React from 'react';
import { CheckRounded, DeleteOutlineRounded, MoreHorizRounded, OpenInNewRounded } from '@mui/icons-material';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { PriorityChip } from '@/components/project-platform/ProjectBadges';
import type { TaskCardProps } from '../types';
import { formatDate } from '@/lib/date-format';

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpen,
  draggable,
  onDragStart,
  onDragEnd,
  projectName,
  canDelete = false,
  canComplete = false,
  onDelete,
  onComplete,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
  <article
    draggable={draggable}
    onDragStart={(event) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', task.id);
      onDragStart(task.id);
    }}
    onDragEnd={onDragEnd}
    className={`group rounded-xl border border-white/90 bg-white/95 p-3.5 shadow-md shadow-slate-900/[0.08] transition-all duration-200 hover:-translate-y-1 hover:border-accent/35 hover:shadow-xl dark:border-white/10 dark:bg-[var(--bg-card)] dark:shadow-black/25 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
  >
    <div className="mb-3 flex items-start justify-between gap-2">
      <PriorityChip priority={task.priority} />
      <IconButton
        aria-label="Acciones de la tarea"
        onClick={(event) => { event.stopPropagation(); setMenuAnchor(event.currentTarget); }}
        onPointerDown={(event) => event.stopPropagation()}
        size="small"
        sx={{ color: 'var(--text-muted)', mt: -0.75, mr: -0.75 }}
      >
        <MoreHorizRounded fontSize="small" />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setMenuAnchor(null); onOpen(task); }}><OpenInNewRounded fontSize="small" sx={{ mr: 1 }} />Editar tarea</MenuItem>
        {canComplete ? <MenuItem onClick={() => { setMenuAnchor(null); onComplete?.(); }}><CheckRounded fontSize="small" sx={{ mr: 1 }} />Completar tarea</MenuItem> : null}
        {canDelete ? <MenuItem onClick={() => { setMenuAnchor(null); onDelete?.(); }} sx={{ color: 'error.main' }}><DeleteOutlineRounded fontSize="small" sx={{ mr: 1 }} />Eliminar tarea</MenuItem> : null}
      </Menu>
    </div>
    <h3 className="text-sm font-semibold leading-5 text-text">{task.title}</h3>
    <p className="mt-2 truncate text-xs font-medium text-text-secondary">{projectName}</p>
    {task.blockedReason ? (
      <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 p-2.5 text-xs leading-5 text-rose-700 dark:text-rose-300">
        {task.blockedReason}
      </p>
    ) : null}
    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
      <div className="flex items-center gap-2">
        <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
          {task.assignee[0]}
        </Avatar>
        <span className="max-w-24 truncate text-xs text-text-secondary">
          {task.assignee.split(' ')[0]}
        </span>
      </div>
      <span className="text-[11px] font-medium text-text-muted">
        {formatDate(task.dueDate)}
      </span>
    </div>
  </article>
  );
};

export default TaskCard;
