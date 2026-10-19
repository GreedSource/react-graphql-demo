import type * as React from 'react';
import { useState } from 'react';
import CheckRounded from '@mui/icons-material/CheckRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { PriorityChip } from '@/components/project-platform/ProjectBadges';
import { formatDate } from '@/lib/date-format';
import type { TaskCardProps } from '../types';

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

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => setMenuAnchor(null);
  const openTask = () => {
    closeMenu();
    onOpen(task);
  };
  const completeTask = () => {
    closeMenu();
    onComplete?.();
  };
  const deleteTask = () => {
    closeMenu();
    onDelete?.();
  };

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
          onClick={openMenu}
          onPointerDown={(event) => event.stopPropagation()}
          size="small"
          sx={{ color: 'var(--text-muted)', mt: -0.75, mr: -0.75 }}
        >
          <MoreHorizRounded fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
        >
          <MenuItem onClick={openTask}>
            <OpenInNewRounded fontSize="small" sx={{ mr: 1 }} />
            Editar tarea
          </MenuItem>
          {canComplete ? (
            <MenuItem onClick={completeTask}>
              <CheckRounded fontSize="small" sx={{ mr: 1 }} />
              Completar tarea
            </MenuItem>
          ) : null}
          {canDelete ? (
            <MenuItem onClick={deleteTask} sx={{ color: 'error.main' }}>
              <DeleteOutlineRounded fontSize="small" sx={{ mr: 1 }} />
              Eliminar tarea
            </MenuItem>
          ) : null}
        </Menu>
      </div>

      <h3 className="text-sm font-semibold leading-5 text-text">{task.title}</h3>
      <p className="mt-2 truncate text-xs font-medium text-text-secondary">
        {projectName}
      </p>
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
