import * as React from 'react';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import FolderRounded from '@mui/icons-material/FolderRounded';
import PersonOffRounded from '@mui/icons-material/PersonOffRounded';
import PriorityHighRounded from '@mui/icons-material/PriorityHighRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import TimelineRounded from '@mui/icons-material/TimelineRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { Link, useNavigate } from 'react-router-dom';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { PriorityChip, TaskStatusChip } from '@/components/project-platform/ProjectBadges';
import { AnalyticsBarChart } from '@/components/ui/AnalyticsBarChart';
import { DonutChart } from '@/components/ui/DonutChart';
import { AnalyticsTrendChart } from '@/components/ui/AnalyticsTrendChart';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProfileQuery } from '@/hooks/auth.hook';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { formatDate } from '@/lib/date-format';
import { getApolloErrorMessage } from '@/lib/graphql';
import {
  getProjectAnalytics,
  getTaskActivityTrend,
  isTaskDueSoon,
  isTaskOverdue,
  taskPriorityColors,
  taskPriorityOrder,
  taskStatusColors,
  taskStatusOrder,
  type ProjectHealth,
} from '@/lib/project-analytics';
import { priorityLabels, taskStatusLabels } from '@/lib/project-platform-labels';

const healthMeta: Record<ProjectHealth, { label: string; classes: string }> = {
  risk: { label: 'Requiere atención', classes: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
  attention: { label: 'Próximo vencimiento', classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  healthy: { label: 'En control', classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
};

const HomePageContent: React.FC = () => {
  const navigate = useNavigate();
  const profileQuery = useProfileQuery();
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const profile = profileQuery.data?.profile?.data;
  const projects = projectsQuery.data?.projects?.data ?? [];
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  const analytics = getProjectAnalytics(projects, tasks);
  const activityTrend = getTaskActivityTrend(tasks);
  const error = profileQuery.error || projectsQuery.error || tasksQuery.error;

  const statusData = taskStatusOrder.map((status) => ({
    label: taskStatusLabels[status],
    value: analytics.statusCounts[status],
    color: taskStatusColors[status],
  }));
  const priorityData = taskPriorityOrder.map((priority) => ({
    label: priorityLabels[priority],
    value: analytics.priorityCounts[priority],
    color: taskPriorityColors[priority],
  }));
  const pendingProjectData = analytics.projectSummaries
    .filter(({ totalTasks }) => totalTasks > 0)
    .slice()
    .sort((left, right) => (right.totalTasks - right.completedTasks) - (left.totalTasks - left.completedTasks))
    .slice(0, 6)
    .map(({ project, totalTasks, completedTasks }) => ({
      label: project.name,
      value: totalTasks - completedTasks,
      color: '#f59e0b',
      caption: `${totalTasks - completedTasks} pendientes`,
    }));
  const projectProgress = analytics.projectSummaries
    .slice()
    .sort((left, right) => right.progress - left.progress)
    .slice(0, 6)
    .map(({ project, progress, completedTasks, totalTasks }) => ({
      projectId: project.id,
      label: project.name,
      value: progress,
      caption: `${completedTasks}/${totalTasks} tareas completadas`,
    }));
  const prioritizedProjects = analytics.projectSummaries
    .slice()
    .sort((left, right) => {
      const healthWeight = { risk: 3, attention: 2, healthy: 1 };
      return healthWeight[right.health] - healthWeight[left.health]
        || (right.overdueTasks + right.blockedTasks) - (left.overdueTasks + left.blockedTasks)
        || right.progress - left.progress;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumen"
        title={`Buenos días${profile ? `, ${profile.name}` : ''}.`}
        description="Una lectura ejecutiva de la salud del portafolio, los riesgos abiertos y el trabajo que merece atención."
        actions={
          <>
            <Button component={Link} to="/reports" size="medium" variant="outlined">Ver reportes</Button>
            <PermissionAction permission="projects.create" size="medium" variant="contained" onClick={() => navigate('/projects?create=1')}>
              Nuevo proyecto
            </PermissionAction>
          </>
        }
      />

      {error ? <Alert severity="error">{getApolloErrorMessage(error)}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
        <MetricCard label="Proyectos activos" value={analytics.activeProjects} detail={`${analytics.atRiskProjects.length} con señales de atención`} icon={<FolderRounded />} />
        <MetricCard label="Trabajo completado" value={`${analytics.completionRate}%`} detail={`${analytics.completedTasks} de ${analytics.totalTasks} tareas`} icon={<CheckCircleRounded />} tone="green" />
        <MetricCard label="Tareas en riesgo" value={analytics.riskTasks.length} detail={`${analytics.blockedTasks} bloqueadas · ${analytics.overdueTasks.length} vencidas`} icon={<ErrorOutlineRounded />} tone="rose" />
        <MetricCard label="Próximos vencimientos" value={analytics.dueSoonTasks.length} detail={`${analytics.unassignedTasks.length} sin asignar`} icon={<ScheduleRounded />} tone="amber" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard
          title="Avance del portafolio"
          description="Los proyectos con mayor porcentaje de tareas completadas aparecen primero."
          icon={<TrendingUpRounded />}
          badge={analytics.activeProjects}
          action={<Button component={Link} to="/projects" size="small" endIcon={<ArrowForwardRounded />}>Ver proyectos</Button>}
        >
          <AnalyticsBarChart data={projectProgress} emptyLabel="Crea un proyecto para comenzar a medir el avance." valueFormatter={(value) => `${value}%`} />
        </SectionCard>
        <SectionCard title="Estado del trabajo" description="Distribución de las tareas por etapa actual." icon={<AssignmentRounded />}>
          <DonutChart data={statusData} centerValue={analytics.totalTasks} centerLabel="tareas" />
        </SectionCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Prioridad del trabajo" description="La carga se concentra en las prioridades que requieren más seguimiento." icon={<PriorityHighRounded />}>
          <AnalyticsBarChart data={priorityData} emptyLabel="Aún no hay tareas para distribuir por prioridad." valueFormatter={(value) => `${value} tareas`} />
        </SectionCard>
        <SectionCard title="Foco inmediato" description="Bloqueos y fechas que pueden afectar el ritmo del equipo." icon={<WarningAmberRounded />} action={<Button component={Link} to="/tasks" size="small">Abrir tareas</Button>}>
          <div className="space-y-3">
            {analytics.attentionTasks.slice(0, 5).map((task) => {
              const overdue = isTaskOverdue(task);
              const dueSoon = isTaskDueSoon(task);
              const attentionLabel = task.status === 'blocked' ? 'Bloqueada' : overdue ? 'Vencida' : dueSoon ? 'Vence pronto' : 'Revisar';
              return (
                <button className="w-full rounded-xl border border-border p-3 text-left transition-colors hover:border-accent/40 hover:bg-surface-elevated" onClick={() => navigate('/tasks')} key={task.id}>
                  <div className="flex items-start gap-3">
                    <WarningAmberRounded className="mt-0.5 shrink-0 text-amber-500" fontSize="small" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">{task.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <PriorityChip priority={task.priority} />
                        <span className="rounded-md bg-surface-elevated px-2 py-1 text-[11px] font-semibold text-text-secondary">{attentionLabel}</span>
                        {task.dueDate ? <span className="inline-flex items-center gap-1 text-[11px] text-text-muted"><ScheduleRounded fontSize="inherit" />{formatDate(task.dueDate)}</span> : null}
                      </div>
                    </div>
                    <TaskStatusChip status={task.status} />
                  </div>
                </button>
              );
            })}
            {!analytics.attentionTasks.length ? (
              <div className="rounded-xl border border-dashed border-border p-7 text-center">
                <CheckCircleRounded className="mb-2 text-emerald-500" />
                <p className="text-sm font-medium text-text">Todo bajo control</p>
                <p className="mt-1 text-xs text-text-muted">No hay bloqueos ni vencimientos próximos.</p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Tendencia de actividad" description="Compara el ritmo de creación, finalización y vencimiento de tareas." icon={<TimelineRounded />} badge="14 días">
        <AnalyticsTrendChart data={activityTrend} />
      </SectionCard>

      <SectionCard title="Trabajo pendiente por proyecto" description="Dónde se concentra la mayor cantidad de tareas que todavía no están completadas." icon={<AssignmentRounded />}>
        <AnalyticsBarChart data={pendingProjectData} emptyLabel="No hay tareas pendientes para comparar." valueFormatter={(value) => `${value} pendientes`} />
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="workspace-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-semibold text-text">Portafolio</h2>
              <p className="mt-1 text-xs text-text-muted">Resumen del avance por proyecto</p>
            </div>
            <Button component={Link} to="/projects" size="small" endIcon={<ArrowForwardRounded />}>Ver todos</Button>
          </div>
          <div className="divide-y divide-border">
            {projectProgress.map((item) => {
              const project = projects.find(({ id }) => id === item.projectId);
              if (!project) return null;
              return (
                <Link className="grid gap-3 p-4 transition-colors hover:bg-surface-elevated sm:grid-cols-[1fr_180px] sm:items-center" to={`/projects/${project.id}`} key={project.id}>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text">{project.name}</p>
                    <p className="truncate text-xs text-text-muted">{project.description || 'Sin descripción disponible'}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-text-muted"><span>Avance</span><strong className="text-text">{item.value}%</strong></div>
                    <LinearProgress variant="determinate" value={item.value} />
                  </div>
                </Link>
              );
            })}
            {!projects.length && !projectsQuery.loading ? <p className="p-8 text-center text-sm text-text-muted">Aún no tienes proyectos para mostrar.</p> : null}
          </div>
        </section>

        <section className="workspace-card overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-start gap-3">
              <PersonOffRounded className="mt-0.5 text-accent" />
              <div>
                <h2 className="font-semibold text-text">Señales por proyecto</h2>
                <p className="mt-1 text-xs text-text-muted">Riesgo y fechas antes que porcentaje aislado.</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {prioritizedProjects.map(({ project, health, progress, blockedTasks, overdueTasks, dueSoonTasks }) => (
              <Link className="block p-4 transition-colors hover:bg-surface-elevated" to={`/projects/${project.id}`} key={project.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-text">{project.name}</p>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${healthMeta[health].classes}`}>{healthMeta[health].label}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-secondary">
                  <span>{progress}% completado</span>
                  <span>{blockedTasks + overdueTasks + dueSoonTasks} señales</span>
                </div>
              </Link>
            ))}
            {!prioritizedProjects.length && !projectsQuery.loading ? <p className="p-8 text-center text-sm text-text-muted">Aún no hay proyectos para analizar.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePageContent;
