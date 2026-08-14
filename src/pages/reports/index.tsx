import * as React from 'react';
import { Alert, LinearProgress } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { getApolloErrorMessage } from '@/lib/graphql';

const ReportsPageContent: React.FC = () => {
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const projects = projectsQuery.data?.projects?.data ?? [];
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  return <div className="space-y-6">
    <PageHeader eyebrow="Reportes" title="Salud del portafolio" description="Resumen de solo lectura calculado con proyectos y tareas reales." />
    {(projectsQuery.error || tasksQuery.error) ? <Alert severity="error">{getApolloErrorMessage(projectsQuery.error || tasksQuery.error)}</Alert> : null}
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">{projects.map((project) => { const projectTasks = tasks.filter((task) => task.projectId === project.id); const done = projectTasks.filter((task) => task.status === 'done').length; const blocked = projectTasks.filter((task) => task.status === 'blocked').length; const progress = projectTasks.length ? Math.round(done / projectTasks.length * 100) : 0; return <article className="workspace-card rounded-lg p-5" key={project.id}><p className="text-xs uppercase text-text-muted">{project.status}</p><h2 className="mt-1 font-semibold">{project.name}</h2><div className="my-5"><div className="mb-2 flex justify-between text-sm"><span className="text-text-secondary">Tareas completadas</span><strong>{progress}%</strong></div><LinearProgress variant="determinate" value={progress} /></div><dl className="grid grid-cols-3 gap-2 text-center"><div className="rounded bg-surface-elevated p-3"><dt className="text-xs text-text-muted">Total</dt><dd className="text-lg font-semibold">{projectTasks.length}</dd></div><div className="rounded bg-surface-elevated p-3"><dt className="text-xs text-text-muted">Hechas</dt><dd className="text-lg font-semibold">{done}</dd></div><div className="rounded bg-red-500/5 p-3"><dt className="text-xs text-text-muted">Bloqueadas</dt><dd className="text-lg font-semibold">{blocked}</dd></div></dl></article>; })}</div>
  </div>;
};
export default ReportsPageContent;
