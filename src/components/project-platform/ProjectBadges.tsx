import type * as React from 'react';
import { Chip } from '@mui/material';
import type {
  ProjectRole,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from '@/types/project-platform';
import { priorityLabels, roleLabels, taskStatusLabels } from '@/lib/project-platform-labels';

interface ProjectRoleChipProps {
  role: ProjectRole;
}

interface ProjectStatusChipProps {
  status: ProjectStatus;
}

interface TaskStatusChipProps {
  status: TaskStatus;
}

interface PriorityChipProps {
  priority: TaskPriority;
}

export const ProjectRoleChip: React.FC<ProjectRoleChipProps> = ({ role }) => {
  return <Chip label={roleLabels[role]} size="small" variant="outlined" />;
};

export const ProjectStatusChip: React.FC<ProjectStatusChipProps> = ({
  status,
}) => {
  const color = status === 'active' ? 'success' : status === 'at_risk' ? 'warning' : 'default';

  return (
    <Chip
      label={status === 'at_risk' ? 'At risk' : status}
      color={color}
      size="small"
      variant={status === 'archived' ? 'outlined' : 'filled'}
    />
  );
};

export const TaskStatusChip: React.FC<TaskStatusChipProps> = ({ status }) => {
  const color =
    status === 'done'
      ? 'success'
      : status === 'blocked'
        ? 'error'
        : status === 'in_progress'
          ? 'info'
          : 'default';

  return <Chip label={taskStatusLabels[status]} color={color} size="small" />;
};

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority }) => {
  const priorityStyles: Record<TaskPriority, { background: string; color: string; border: string; dot: string }> = {
    critical: { background: 'color-mix(in srgb, #fb7185 18%, transparent)', color: '#be123c', border: 'color-mix(in srgb, #fb7185 35%, transparent)', dot: '#e11d48' },
    urgent: { background: 'color-mix(in srgb, #f97316 18%, transparent)', color: '#c2410c', border: 'color-mix(in srgb, #f97316 35%, transparent)', dot: '#ea580c' },
    high: { background: 'color-mix(in srgb, #f59e0b 20%, transparent)', color: '#a16207', border: 'color-mix(in srgb, #f59e0b 38%, transparent)', dot: '#d97706' },
    medium: { background: 'color-mix(in srgb, #38bdf8 18%, transparent)', color: '#0369a1', border: 'color-mix(in srgb, #38bdf8 35%, transparent)', dot: '#0284c7' },
    low: { background: 'color-mix(in srgb, #94a3b8 18%, transparent)', color: 'var(--text-secondary)', border: 'color-mix(in srgb, #94a3b8 35%, transparent)', dot: '#64748b' },
  };
  const style = priorityStyles[priority];

  return (
    <Chip
      label={priorityLabels[priority]}
      size="small"
      icon={<span style={{ width: 7, height: 7, borderRadius: 999, background: style.dot }} />}
      sx={{
        height: 28,
        borderRadius: '8px',
        backgroundColor: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 750,
        fontSize: 11,
        letterSpacing: '0.01em',
        '& .MuiChip-icon': { marginLeft: '8px', marginRight: '-3px' },
        '& .MuiChip-label': { paddingInline: '9px' },
        '.dark &': { color: 'var(--text-primary)' },
      }}
    />
  );
};
