import type { ProjectTask } from '@/types/project-platform';

export interface TaskCardProps {
  task: ProjectTask;
  onOpen: (task: ProjectTask) => void;
  draggable: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  projectName: string;
  canDelete?: boolean;
  canComplete?: boolean;
  onDelete?: () => void;
  onComplete?: () => void;
}
