import * as React from 'react';
import {
  ArrowForwardRounded,
  AssignmentRounded,
  CheckCircleRounded,
  ErrorOutlineRounded,
  FolderRounded,
  HistoryRounded,
  TrendingUpRounded,
} from '@mui/icons-material';
import { Alert, Button, LinearProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useProfileQuery } from '@/hooks/auth.hook';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { useAuditLogs } from '@/hooks/audit.hook';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { PriorityChip, TaskStatusChip } from '@/components/project-platform/ProjectBadges';
import { AnalyticsBarChart } from '@/components/ui/AnalyticsBarChart';
import { DonutChart } from '@/components/ui/DonutChart';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import { taskStatusLabels } from '@/lib/project-platform-labels';

const statusColors: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#38bdf8',
  blocked: '#fb7185',
  done: '#34d399',
};

const HomePageContent: React.FC = () => {
  const navigate = useNavigate();
  const profileQuery = useProfileQuery();
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const auditQuery = useAuditLogs(10);
  const profile = profileQuery.data?.profile?.data;
  const projects = projectsQuery.data?.projects?.data ?? [];
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  const logs = auditQuery.data?.auditLogs?.data ?? [];
  const blocked = tasks.filter((task) => task.status === 'blocked');
  const doneTasks = tasks.filter((task) => task.status === 'done').length;
  const completionRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const error = profileQuery.error || projectsQuery.error || tasksQuery.error || auditQuery.error;
  const projectName = (id: string) => projects.find((project) => project.id === id)?.name ?? 'Proyecto sin nombre';
  const statusData = (Object.keys(taskStatusLabels) as Array<keyof typeof taskStatusLabels>).map((status) => ({
    label: taskStatusLabels[status],
    value: tasks.filter((task) => task.status === status).length,
    color: statusColors[status],
  }));
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const done = projectTasks.filter((task) => task.status === 'done').length;
    return {
      label: project.name,
      value: projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0,
      caption: `${done}/${projectTasks.length} tareas completadas`,
    };
  }).sort((left, right) => right.value - left.value).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Centro de operaciones</p>
            <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Buenos días{profile ? `, ${profile.name}` : ''}.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Una vista rápida de la salud de tus proyectos, el trabajo pendiente y las decisiones recientes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button component={Link} to="/reports" size="medium" variant="outlined">Ver reportes</Button>
            <PermissionAction permission="projects.create" size="medium" variant="contained" onClick={() => navigate('/projects?create=1')}>
              Nuevo proyecto
            </PermissionAction>
          </div>
        </div>
      </section>

      {error ? <Alert severity="error">{getApolloErrorMessage(error)}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
        <MetricCard label="Proyectos activos" value={projects.length} detail="En seguimiento" icon={<FolderRounded />} />
        <MetricCard label="Tareas en curso" value={tasks.length} detail={`${completionRate}% completadas`} icon={<AssignmentRounded />} tone="blue" />
        <MetricCard label="Bloqueos activos" value={blocked.length} detail={blocked.length ? 'Requieren atención' : 'Todo despejado'} icon={<ErrorOutlineRounded />} tone="rose" />
        <MetricCard label="Actividad reciente" value={logs.length} detail="Últimos eventos registrados" icon={<HistoryRounded />} tone="amber" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard title="Avance del portafolio" description="Los proyectos con mayor porcentaje de tareas completadas aparecen primero." icon={<TrendingUpRounded />} action={<Button component={Link} to="/projects" size="small" endIcon={<ArrowForwardRounded />}>Ver proyectos</Button>}>
          <AnalyticsBarChart data={projectProgress} emptyLabel="Crea un proyecto para comenzar a medir el avance." valueFormatter={(value) => `${value}%`} />
        </SectionCard>
        <SectionCard title="Distribución del trabajo" description="Tareas agrupadas por estado actual." icon={<AssignmentRounded />}>
          <DonutChart data={statusData} centerValue={tasks.length} centerLabel="tareas" />
        </SectionCard>
      </section>

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
            {projects.slice(0, 5).map((project) => {
              const projectTasks = tasks.filter((task) => task.projectId === project.id);
              const projectDone = projectTasks.filter((task) => task.status === 'done').length;
              const value = projectTasks.length ? Math.round((projectDone / projectTasks.length) * 100) : 0;
              return (
                <Link className="grid gap-3 p-4 transition-colors hover:bg-surface-elevated sm:grid-cols-[1fr_180px] sm:items-center" to={`/projects/${project.id}`} key={project.id}>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text">{project.name}</p>
                    <p className="truncate text-xs text-text-muted">{project.description || 'Sin descripción disponible'}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-text-muted"><span>Avance</span><strong className="text-text">{value}%</strong></div>
                    <LinearProgress variant="determinate" value={value} />
                  </div>
                </Link>
              );
            })}
            {!projects.length && !projectsQuery.loading ? <p className="p-8 text-center text-sm text-text-muted">Aún no tienes proyectos para mostrar.</p> : null}
          </div>
        </section>

        <section className="workspace-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-text">Tareas bloqueadas</h2>
              <p className="mt-1 text-xs text-text-muted">Prioriza lo que puede retrasar una entrega.</p>
            </div>
            <Button component={Link} to="/tasks" size="small">Abrir tablero</Button>
          </div>
          <div className="space-y-3">
            {blocked.slice(0, 5).map((task) => (
              <button className="w-full rounded-xl border border-border p-3 text-left transition-colors hover:border-accent/40 hover:bg-surface-elevated" onClick={() => navigate('/tasks')} key={task.id}>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{task.title}</p>
                    <p className="mt-1 text-xs text-text-muted">{projectName(task.projectId)}</p>
                  </div>
                  <PriorityChip priority={task.priority} />
                  <TaskStatusChip status={task.status} />
                </div>
              </button>
            ))}
            {!blocked.length ? <div className="rounded-xl border border-dashed border-border p-7 text-center"><CheckCircleRounded className="mb-2 text-emerald-500" /><p className="text-sm font-medium text-text">Todo despejado</p><p className="mt-1 text-xs text-text-muted">No hay tareas bloqueadas en este momento.</p></div> : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePageContent;
