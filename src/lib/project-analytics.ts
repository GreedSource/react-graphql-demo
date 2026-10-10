import type {
  ProjectEntity,
  TaskEntity,
  TaskPriority,
  TaskStatus,
} from '@/types/project-platform';

export type ProjectHealth = 'healthy' | 'attention' | 'risk';

export const taskStatusOrder: TaskStatus[] = [
  'todo',
  'in_progress',
  'blocked',
  'done',
];

export const taskPriorityOrder: TaskPriority[] = [
  'critical',
  'urgent',
  'high',
  'medium',
  'low',
];

export const taskStatusColors: Record<TaskStatus, string> = {
  todo: '#94a3b8',
  in_progress: '#38bdf8',
  blocked: '#fb7185',
  done: '#34d399',
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  critical: '#e11d48',
  urgent: '#ea580c',
  high: '#d97706',
  medium: '#0284c7',
  low: '#64748b',
};

export interface ProjectAnalytics {
  project: ProjectEntity;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  progress: number;
  health: ProjectHealth;
}

export interface ProjectAnalyticsSummary {
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  todoTasks: number;
  completionRate: number;
  riskTasks: TaskEntity[];
  overdueTasks: TaskEntity[];
  dueSoonTasks: TaskEntity[];
  unassignedTasks: TaskEntity[];
  attentionTasks: TaskEntity[];
  statusCounts: Record<TaskStatus, number>;
  priorityCounts: Record<TaskPriority, number>;
  projectSummaries: ProjectAnalytics[];
  atRiskProjects: ProjectAnalytics[];
}

export interface TaskActivityTrendDatum {
  dateKey: string;
  label: string;
  created: number;
  completed: number;
  due: number;
}

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const parseDueDate = (value?: string | null) => {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T23:59:59`
    : value.includes(' ') && !value.includes('T')
      ? value.replace(' ', 'T')
      : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const trendLabelFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
});

export function getTaskActivityTrend(
  tasks: TaskEntity[],
  days = 14,
  referenceDate = new Date(),
): TaskActivityTrendDatum[] {
  const today = startOfDay(referenceDate);
  const firstDay = new Date(today);
  firstDay.setDate(firstDay.getDate() - (days - 1));
  const trendDays = Array.from({ length: days }, (_, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    return date;
  });
  const trend = new Map<string, Omit<TaskActivityTrendDatum, 'dateKey' | 'label'>>();

  trendDays.forEach((date) => {
    trend.set(toDayKey(date), { created: 0, completed: 0, due: 0 });
  });

  tasks.forEach((task) => {
    const createdDate = parseDueDate(task.createdAt);
    const completedDate = parseDueDate(task.completedAt);
    const dueDate = parseDueDate(task.dueDate);
    const createdDay = createdDate ? trend.get(toDayKey(createdDate)) : undefined;
    const completedDay = completedDate ? trend.get(toDayKey(completedDate)) : undefined;
    const dueDay = dueDate && task.status !== 'done' ? trend.get(toDayKey(dueDate)) : undefined;

    if (createdDay) createdDay.created += 1;
    if (completedDay) completedDay.completed += 1;
    if (dueDay) dueDay.due += 1;
  });

  return trendDays.map((date) => {
    const dateKey = toDayKey(date);
    const values = trend.get(dateKey) ?? { created: 0, completed: 0, due: 0 };
    return {
      dateKey,
      label: trendLabelFormatter.format(date),
      ...values,
    };
  });
}

export function isTaskOverdue(task: TaskEntity, referenceDate = new Date()) {
  const dueDate = parseDueDate(task.dueDate);
  return task.status !== 'done' && Boolean(dueDate && dueDate < startOfDay(referenceDate));
}

export function isTaskDueSoon(task: TaskEntity, referenceDate = new Date()) {
  const dueDate = parseDueDate(task.dueDate);
  if (task.status === 'done' || !dueDate) return false;

  const today = startOfDay(referenceDate);
  const soonLimit = new Date(today);
  soonLimit.setDate(soonLimit.getDate() + 7);
  return dueDate >= today && dueDate <= endOfDay(soonLimit);
}

const priorityScore: Record<TaskPriority, number> = {
  critical: 5,
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const attentionScore = (task: TaskEntity, referenceDate: Date) => {
  const overdue = isTaskOverdue(task, referenceDate);
  const dueSoon = isTaskDueSoon(task, referenceDate);
  return (
    (task.status === 'blocked' ? 300 : 0)
    + (overdue ? 200 : 0)
    + (dueSoon ? 100 : 0)
    + priorityScore[task.priority]
  );
};

export function getProjectAnalytics(
  projects: ProjectEntity[],
  tasks: TaskEntity[],
  referenceDate = new Date(),
): ProjectAnalyticsSummary {
  const statusCounts = taskStatusOrder.reduce<Record<TaskStatus, number>>((counts, status) => {
    counts[status] = 0;
    return counts;
  }, {} as Record<TaskStatus, number>);
  const priorityCounts = taskPriorityOrder.reduce<Record<TaskPriority, number>>((counts, priority) => {
    counts[priority] = 0;
    return counts;
  }, {} as Record<TaskPriority, number>);

  const tasksByProject = new Map<string, TaskEntity[]>();
  const overdueTasks: TaskEntity[] = [];
  const dueSoonTasks: TaskEntity[] = [];
  const unassignedTasks: TaskEntity[] = [];

  tasks.forEach((task) => {
    statusCounts[task.status] += 1;
    priorityCounts[task.priority] += 1;

    const projectTasks = tasksByProject.get(task.projectId) ?? [];
    projectTasks.push(task);
    tasksByProject.set(task.projectId, projectTasks);

    if (isTaskOverdue(task, referenceDate)) overdueTasks.push(task);
    if (isTaskDueSoon(task, referenceDate)) dueSoonTasks.push(task);
    if (task.status !== 'done' && !task.assigneeId) unassignedTasks.push(task);
  });

  const projectSummaries = projects.map((project) => {
    const projectTasks = tasksByProject.get(project.id) ?? [];
    const completedTasks = projectTasks.filter((task) => task.status === 'done').length;
    const blockedTasks = projectTasks.filter((task) => task.status === 'blocked').length;
    const overdueTasksCount = projectTasks.filter((task) => isTaskOverdue(task, referenceDate)).length;
    const dueSoonTasksCount = projectTasks.filter((task) => isTaskDueSoon(task, referenceDate)).length;
    const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
    const health: ProjectHealth = blockedTasks || overdueTasksCount
      ? 'risk'
      : dueSoonTasksCount
        ? 'attention'
        : 'healthy';

    return {
      project,
      totalTasks: projectTasks.length,
      completedTasks,
      blockedTasks,
      overdueTasks: overdueTasksCount,
      dueSoonTasks: dueSoonTasksCount,
      progress,
      health,
    };
  });

  const attentionTasks = tasks
    .filter((task) => task.status === 'blocked' || isTaskOverdue(task, referenceDate) || isTaskDueSoon(task, referenceDate))
    .sort((left, right) => attentionScore(right, referenceDate) - attentionScore(left, referenceDate));
  const riskTasks = tasks.filter((task) => task.status === 'blocked' || isTaskOverdue(task, referenceDate));

  const totalTasks = tasks.length;
  const completedTasks = statusCounts.done;
  const atRiskProjects = projectSummaries.filter(({ health }) => health !== 'healthy');

  return {
    activeProjects: projects.filter((project) => !project.archivedAt).length,
    totalTasks,
    completedTasks,
    inProgressTasks: statusCounts.in_progress,
    blockedTasks: statusCounts.blocked,
    todoTasks: statusCounts.todo,
    completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    riskTasks,
    overdueTasks,
    dueSoonTasks,
    unassignedTasks,
    attentionTasks,
    statusCounts,
    priorityCounts,
    projectSummaries,
    atRiskProjects,
  };
}
