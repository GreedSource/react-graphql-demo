import type * as React from 'react';
import { MoreHorizRounded } from '@mui/icons-material';
import { Avatar, IconButton } from '@mui/material';
import { PriorityChip } from '@/components/project-platform/ProjectBadges';
import type { TaskCardProps } from '../types';

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpen,
  draggable,
  onDragStart,
  onDragEnd,
  projectName,
}) => (
  <article
    draggable={draggable}
    onDragStart={(event) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', task.id);
      onDragStart(task.id);
    }}
    onDragEnd={onDragEnd}
    className={`group rounded-md border border-border bg-surface-card p-3.5 shadow-sm shadow-black/[0.02] transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
  >
    <div className="mb-3 flex items-start justify-between gap-2">
      <PriorityChip priority={task.priority} />
      <IconButton
        aria-label="Abrir detalle"
        onClick={() => onOpen(task)}
        size="small"
        sx={{ color: 'var(--text-muted)', mt: -0.75, mr: -0.75 }}
      >
        <MoreHorizRounded fontSize="small" />
      </IconButton>
    </div>
    <h3 className="text-sm font-semibold leading-5 text-text">{task.title}</h3>
    <p className="mt-2 truncate text-xs text-text-muted">{projectName}</p>
    {task.blockedReason ? (
      <p className="mt-3 rounded bg-red-500/10 p-2 text-xs leading-5 text-red-700 dark:text-red-300">
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
        {task.dueDate.slice(5)}
      </span>
    </div>
  </article>
);

export default TaskCard;
