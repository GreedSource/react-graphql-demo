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
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { Link } from 'react-router-dom';
import { AnalyticsBarChart } from '@/components/ui/AnalyticsBarChart';
import AnalyticsExportMenu, { type AnalyticsExportRow } from '@/components/ui/AnalyticsExportMenu';
import { DonutChart } from '@/components/ui/DonutChart';
import { AnalyticsTrendChart } from '@/components/ui/AnalyticsTrendChart';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import {
  getProjectAnalytics,
  getTaskActivityTrend,
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

const ReportsPageContent: React.FC = () => {
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const projects = projectsQuery.data?.projects?.data ?? [];
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  const analytics = getProjectAnalytics(projects, tasks);
  const activityTrend = getTaskActivityTrend(tasks);
  const error = projectsQuery.error || tasksQuery.error;
  const trendCardRef = React.useRef<HTMLElement | null>(null);
  const statusCardRef = React.useRef<HTMLElement | null>(null);
  const priorityCardRef = React.useRef<HTMLElement | null>(null);
  const progressCardRef = React.useRef<HTMLElement | null>(null);
  const pendingCardRef = React.useRef<HTMLElement | null>(null);
  const signalsCardRef = React.useRef<HTMLElement | null>(null);
  const projectDetailsRef = React.useRef<HTMLElement | null>(null);

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
  const statusExportRows: AnalyticsExportRow[] = statusData.map(({ label, value }) => ({ Estado: label, Tareas: value }));
  const priorityExportRows: AnalyticsExportRow[] = priorityData.map(({ label, value }) => ({ Prioridad: label, Tareas: value }));
  const trendExportRows: AnalyticsExportRow[] = activityTrend.map(({ label, created, completed, due }) => ({ Fecha: label, Creadas: created, Completadas: completed, Vencen: due }));
  const pendingProjectData = analytics.projectSummaries
    .filter(({ totalTasks }) => totalTasks > 0)
    .slice()
    .sort((left, right) => (right.totalTasks - right.completedTasks) - (left.totalTasks - left.completedTasks))
    .slice(0, 8)
    .map(({ project, totalTasks, completedTasks }) => ({
      label: project.name,
      value: totalTasks - completedTasks,
      color: '#f59e0b',
      caption: `${totalTasks - completedTasks} pendientes`,
    }));
  const projectProgress = analytics.projectSummaries
    .slice()
    .sort((left, right) => right.progress - left.progress)
    .slice(0, 8)
    .map(({ project, progress, completedTasks, totalTasks }) => ({
      label: project.name,
      value: progress,
      caption: `${completedTasks}/${totalTasks} completadas`,
    }));
  const progressExportRows: AnalyticsExportRow[] = projectProgress.map(({ label, value, caption }) => ({ Proyecto: label, Avance: value, Detalle: caption }));
  const pendingExportRows: AnalyticsExportRow[] = pendingProjectData.map(({ label, value, caption }) => ({ Proyecto: label, Pendientes: value, Detalle: caption }));
  const detailProjects = analytics.projectSummaries
    .slice()
    .sort((left, right) => {
      const healthWeight = { risk: 3, attention: 2, healthy: 1 };
      return healthWeight[right.health] - healthWeight[left.health]
        || (right.overdueTasks + right.blockedTasks) - (left.overdueTasks + left.blockedTasks)
        || right.progress - left.progress;
    });
  const projectDetailsExportRows: AnalyticsExportRow[] = detailProjects.map(({ project, totalTasks, completedTasks, blockedTasks, overdueTasks, dueSoonTasks, progress, health }) => ({
    Proyecto: project.name,
    Estado: healthMeta[health].label,
    Tareas: totalTasks,
    Completadas: completedTasks,
    Avance: progress,
    Bloqueadas: blockedTasks,
    Vencidas: overdueTasks,
    'Próximas a vencer': dueSoonTasks,
  }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reportes" title="Salud del portafolio" description="Una lectura operativa de avance, carga, prioridades y riesgos con los datos disponibles ahora mismo." />
      {error ? <Alert severity="error">{getApolloErrorMessage(error)}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen del portafolio">
        <MetricCard label="Proyectos activos" value={analytics.activeProjects} detail={`${analytics.atRiskProjects.length} con señales de atención`} icon={<FolderRounded />} />
        <MetricCard label="Finalización" value={`${analytics.completionRate}%`} detail={`${analytics.completedTasks} de ${analytics.totalTasks} tareas`} icon={<CheckCircleRounded />} tone="green" />
        <MetricCard label="Tareas vencidas" value={analytics.overdueTasks.length} detail={`${analytics.blockedTasks} bloqueadas`} icon={<ErrorOutlineRounded />} tone="rose" />
        <MetricCard label="Sin asignar" value={analytics.unassignedTasks.length} detail="Trabajo pendiente sin responsable" icon={<PersonOffRounded />} tone="amber" />
      </section>

      <section className="rounded-2xl border border-accent/20 bg-accent-soft p-5 sm:p-6" aria-label="Lectura ejecutiva">
        <div className="flex items-start gap-3">
          <TrendingUpRounded className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Lectura ejecutiva</p>
            <p className="mt-2 text-base font-semibold text-text">
              {analytics.completionRate >= 75 ? 'El portafolio mantiene un avance sólido.' : analytics.completionRate >= 40 ? 'El portafolio avanza, pero aún requiere seguimiento constante.' : 'El portafolio necesita foco para recuperar ritmo.'}
            </p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {analytics.overdueTasks.length || analytics.blockedTasks
                ? `${analytics.overdueTasks.length} tareas vencidas y ${analytics.blockedTasks} bloqueadas concentran el riesgo actual.`
                : 'No hay bloqueos ni tareas vencidas en este momento.'}
            </p>
          </div>
        </div>
      </section>

      <SectionCard
        cardRef={trendCardRef}
        title="Tendencia de actividad"
        description="Evolución de las tareas con fechas registradas en los últimos 14 días."
        icon={<TimelineRounded />}
        badge="14 días"
        action={<AnalyticsExportMenu targetRef={trendCardRef} filename="tendencia-de-actividad" title="Tendencia de actividad" rows={trendExportRows} shareText="Tendencia de actividad de tareas en los últimos 14 días." />}
      >
        <AnalyticsTrendChart data={activityTrend} />
      </SectionCard>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          cardRef={statusCardRef}
          title="Estado de las tareas"
          description="Cómo se distribuye la carga actual por etapa."
          icon={<AssignmentRounded />}
          action={<AnalyticsExportMenu targetRef={statusCardRef} filename="estado-de-tareas" title="Estado de las tareas" rows={statusExportRows} shareText={`${analytics.totalTasks} tareas distribuidas por estado.`} />}
        >
          <DonutChart data={statusData} centerValue={analytics.totalTasks} centerLabel="tareas" />
        </SectionCard>
        <SectionCard
          cardRef={priorityCardRef}
          title="Prioridad del trabajo"
          description="Distribución de tareas para entender dónde se concentra la presión operativa."
          icon={<PriorityHighRounded />}
          action={<AnalyticsExportMenu targetRef={priorityCardRef} filename="prioridad-del-trabajo" title="Prioridad del trabajo" rows={priorityExportRows} shareText="Distribución de tareas por prioridad." />}
        >
          <AnalyticsBarChart data={priorityData} emptyLabel="Aún no hay tareas para distribuir por prioridad." valueFormatter={(value) => `${value} tareas`} />
        </SectionCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          cardRef={progressCardRef}
          title="Avance por proyecto"
          description="Comparación del porcentaje de tareas completadas por proyecto."
          icon={<TrendingUpRounded />}
          badge={analytics.activeProjects}
          action={<AnalyticsExportMenu targetRef={progressCardRef} filename="avance-por-proyecto" title="Avance por proyecto" rows={progressExportRows} shareText="Avance de tareas completadas por proyecto." />}
        >
          <AnalyticsBarChart data={projectProgress} emptyLabel="No hay proyectos con tareas para analizar." valueFormatter={(value) => `${value}%`} />
        </SectionCard>
        <SectionCard
          cardRef={signalsCardRef}
          title="Señales operativas"
          description="Indicadores que conviene revisar antes de planificar más trabajo."
          icon={<ScheduleRounded />}
          action={<AnalyticsExportMenu targetRef={signalsCardRef} filename="senales-operativas" title="Señales operativas" rows={[{ Indicador: 'Bloqueadas', Valor: analytics.blockedTasks }, { Indicador: 'Próximos 7 días', Valor: analytics.dueSoonTasks.length }, { Indicador: 'Sin responsable', Valor: analytics.unassignedTasks.length }, { Indicador: 'En curso', Valor: analytics.inProgressTasks }]} shareText="Señales operativas del portafolio." />}
        >
          <div className="divide-y divide-border">
            <Link className="flex items-center justify-between gap-4 py-3 first:pt-0 hover:text-accent" to="/tasks">
              <span className="flex items-center gap-2 text-sm text-text-secondary"><ErrorOutlineRounded fontSize="small" className="text-rose-500" />Bloqueadas</span>
              <strong className="text-text">{analytics.blockedTasks}</strong>
            </Link>
            <Link className="flex items-center justify-between gap-4 py-3 hover:text-accent" to="/tasks">
              <span className="flex items-center gap-2 text-sm text-text-secondary"><ScheduleRounded fontSize="small" className="text-amber-500" />Próximos 7 días</span>
              <strong className="text-text">{analytics.dueSoonTasks.length}</strong>
            </Link>
            <Link className="flex items-center justify-between gap-4 py-3 hover:text-accent" to="/tasks">
              <span className="flex items-center gap-2 text-sm text-text-secondary"><PersonOffRounded fontSize="small" className="text-sky-500" />Sin responsable</span>
              <strong className="text-text">{analytics.unassignedTasks.length}</strong>
            </Link>
            <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
              <span className="flex items-center gap-2 text-sm text-text-secondary"><ArrowForwardRounded fontSize="small" className="text-emerald-500" />En curso</span>
              <strong className="text-text">{analytics.inProgressTasks}</strong>
            </div>
          </div>
          <Button component={Link} to="/tasks" size="small" className="mt-4" endIcon={<ArrowForwardRounded />}>Revisar tareas</Button>
        </SectionCard>
      </section>

      <SectionCard
        cardRef={pendingCardRef}
        title="Trabajo pendiente por proyecto"
        description="La carga abierta permite detectar dónde se acumulan las tareas antes de que se conviertan en riesgo."
        icon={<AssignmentRounded />}
        action={<AnalyticsExportMenu targetRef={pendingCardRef} filename="trabajo-pendiente-por-proyecto" title="Trabajo pendiente por proyecto" rows={pendingExportRows} shareText="Trabajo pendiente por proyecto." />}
      >
        <AnalyticsBarChart data={pendingProjectData} emptyLabel="No hay tareas pendientes para comparar." valueFormatter={(value) => `${value} pendientes`} />
      </SectionCard>

      <section ref={projectDetailsRef} className="workspace-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <h2 className="font-semibold text-text">Detalle por proyecto</h2>
            <p className="mt-1 text-sm text-text-secondary">Los proyectos con riesgos o fechas cercanas aparecen primero para facilitar la decisión.</p>
          </div>
          <AnalyticsExportMenu targetRef={projectDetailsRef} filename="detalle-por-proyecto" title="Detalle por proyecto" rows={projectDetailsExportRows} shareText="Detalle operativo de proyectos." />
        </div>
        <div className="divide-y divide-border">
          {detailProjects.map(({ project, totalTasks, completedTasks, blockedTasks, overdueTasks, dueSoonTasks, progress, health }) => (
            <article className="grid gap-4 p-5 lg:grid-cols-[minmax(220px,0.9fr)_minmax(220px,1fr)_auto] lg:items-center" key={project.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-medium text-text">{project.name}</h3>
                  <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${healthMeta[health].classes}`}>{healthMeta[health].label}</span>
                </div>
                <p className="mt-2 text-xs text-text-muted">{totalTasks} tareas · {completedTasks} completadas</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs"><span className="text-text-secondary">Progreso</span><strong className="text-text">{progress}%</strong></div>
                <LinearProgress variant="determinate" value={progress} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary lg:justify-end">
                <span className="rounded-md bg-rose-500/10 px-2 py-1">{blockedTasks} bloqueadas</span>
                <span className="rounded-md bg-amber-500/10 px-2 py-1">{overdueTasks} vencidas</span>
                <span className="rounded-md bg-sky-500/10 px-2 py-1">{dueSoonTasks} próximas</span>
              </div>
            </article>
          ))}
          {!detailProjects.length && !projectsQuery.loading ? <p className="p-10 text-center text-sm text-text-muted">Aún no hay proyectos para analizar.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default ReportsPageContent;
