import * as React from 'react';
import { AssignmentRounded, CheckCircleRounded, ErrorOutlineRounded, FolderRounded, TrendingUpRounded } from '@mui/icons-material';
import { Alert, LinearProgress } from '@mui/material';
import { AnalyticsBarChart } from '@/components/ui/AnalyticsBarChart';
import { DonutChart } from '@/components/ui/DonutChart';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { taskStatusLabels } from '@/lib/project-platform-labels';

const statusColors: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#38bdf8',
  blocked: '#fb7185',
  done: '#34d399',
};

const ReportsPageContent: React.FC = () => {
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const projects = projectsQuery.data?.projects?.data ?? [];
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  const doneTasks = tasks.filter((task) => task.status === 'done').length;
  const blockedTasks = tasks.filter((task) => task.status === 'blocked').length;
  const activeProjects = projects.filter((project) => !project.archivedAt).length;
  const completionRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const statusData = (Object.keys(taskStatusLabels) as Array<keyof typeof taskStatusLabels>).map((status) => ({
    label: taskStatusLabels[status],
    value: tasks.filter((task) => task.status === status).length,
    color: statusColors[status],
  }));
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const done = projectTasks.filter((task) => task.status === 'done').length;
    const blocked = projectTasks.filter((task) => task.status === 'blocked').length;
    return {
      project,
      projectTasks,
      done,
      blocked,
      progress: projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reportes" title="Salud del portafolio" description="Indicadores operativos calculados con los proyectos y tareas disponibles ahora mismo." />
      {(projectsQuery.error || tasksQuery.error) ? <Alert severity="error">{getApolloErrorMessage(projectsQuery.error || tasksQuery.error)}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen del portafolio">
        <MetricCard label="Proyectos activos" value={activeProjects} icon={<FolderRounded />} />
        <MetricCard label="Tareas completadas" value={`${completionRate}%`} detail={`${doneTasks} de ${tasks.length}`} icon={<CheckCircleRounded />} tone="green" />
        <MetricCard label="Bloqueos" value={blockedTasks} detail={blockedTasks ? 'Requieren seguimiento' : 'Sin bloqueos'} icon={<ErrorOutlineRounded />} tone="rose" />
        <MetricCard label="Carga total" value={tasks.length} detail="Tareas en el portafolio" icon={<AssignmentRounded />} tone="blue" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard title="Avance por proyecto" description="Una lectura rápida del porcentaje de tareas completadas." icon={<TrendingUpRounded />}>
          <AnalyticsBarChart data={projectProgress.map(({ project, progress, done, projectTasks }) => ({ label: project.name, value: progress, caption: `${done}/${projectTasks.length} completadas` }))} emptyLabel="No hay proyectos con tareas para analizar." valueFormatter={(value) => `${value}%`} />
        </SectionCard>
        <SectionCard title="Estado de las tareas" description="Distribución del trabajo por etapa." icon={<AssignmentRounded />}>
          <DonutChart data={statusData} centerValue={tasks.length} centerLabel="tareas" />
        </SectionCard>
      </section>

      <section className="workspace-card overflow-hidden">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 className="font-semibold text-text">Detalle por proyecto</h2>
          <p className="mt-1 text-sm text-text-secondary">Detecta rápidamente qué proyectos avanzan y cuáles necesitan atención.</p>
        </div>
        <div className="divide-y divide-border">
          {projectProgress.map(({ project, projectTasks, done, blocked, progress }) => (
            <article className="grid gap-4 p-5 lg:grid-cols-[minmax(200px,0.9fr)_minmax(220px,1fr)_auto] lg:items-center" key={project.id}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${blocked ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                  <h3 className="truncate font-medium text-text">{project.name}</h3>
                </div>
                <p className="mt-1 text-xs text-text-muted">{projectTasks.length} tareas · {blocked} bloqueadas</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs"><span className="text-text-secondary">Progreso</span><strong className="text-text">{progress}%</strong></div>
                <LinearProgress variant="determinate" value={progress} />
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary lg:justify-end">
                <span><strong className="text-text">{done}</strong> completadas</span>
                <span><strong className="text-text">{projectTasks.length - done}</strong> pendientes</span>
              </div>
            </article>
          ))}
          {!projectProgress.length && !projectsQuery.loading ? <p className="p-10 text-center text-sm text-text-muted">Aún no hay proyectos para analizar.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default ReportsPageContent;
