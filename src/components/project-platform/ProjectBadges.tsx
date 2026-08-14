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
  const color =
    priority === 'critical' || priority === 'urgent'
      ? 'error'
      : priority === 'high'
        ? 'warning'
        : priority === 'medium'
          ? 'info'
          : 'default';

  return (
    <Chip
      label={priorityLabels[priority]}
      color={color}
      size="small"
      variant={priority === 'low' ? 'outlined' : 'filled'}
    />
  );
};
