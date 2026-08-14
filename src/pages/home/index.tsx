import * as React from 'react';
import { ArrowForwardRounded, AssignmentRounded, ErrorOutlineRounded, FolderRounded, HistoryRounded } from '@mui/icons-material';
import { Alert, Button, LinearProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useProfileQuery } from '@/hooks/auth.hook';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { useAuditLogs } from '@/hooks/audit.hook';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { PriorityChip, TaskStatusChip } from '@/components/project-platform/ProjectBadges';
import { getApolloErrorMessage } from '@/lib/graphql';

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
  const error = profileQuery.error || projectsQuery.error || tasksQuery.error || auditQuery.error;
  const projectName = (id: string) => projects.find((project) => project.id === id)?.name ?? 'Proyecto';
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-1 text-sm font-medium text-accent">Centro de operaciones</p><h1 className="text-3xl font-semibold sm:text-4xl">Buenos dias{profile ? `, ${profile.name}` : ''}.</h1><p className="mt-2 text-sm text-text-secondary">Resumen en tiempo real de proyectos, tareas y auditoria.</p></div><div className="flex gap-2"><Button component={Link} to="/reports" variant="outlined">Ver reporte</Button><PermissionAction permission="projects.create" variant="contained" onClick={() => navigate('/projects?create=1')}>Nuevo proyecto</PermissionAction></div></div>
    {error ? <Alert severity="error">{getApolloErrorMessage(error)}</Alert> : null}
    <div className="metric-grid"><div className="bg-surface-card p-5"><FolderRounded className="text-accent" /><p className="mt-3 text-3xl font-semibold">{projects.length}</p><p className="text-xs text-text-muted">Proyectos activos</p></div><div className="bg-surface-card p-5"><AssignmentRounded className="text-sky-600" /><p className="mt-3 text-3xl font-semibold">{tasks.length}</p><p className="text-xs text-text-muted">Tareas totales</p></div><div className="bg-surface-card p-5"><ErrorOutlineRounded className="text-red-500" /><p className="mt-3 text-3xl font-semibold">{blocked.length}</p><p className="text-xs text-text-muted">Bloqueos activos</p></div><div className="bg-surface-card p-5"><HistoryRounded className="text-amber-600" /><p className="mt-3 text-3xl font-semibold">{logs.length}</p><p className="text-xs text-text-muted">Eventos recientes</p></div></div>
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="workspace-card rounded-lg"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">Portafolio</h2><p className="text-xs text-text-muted">Proyectos entregados por el backend</p></div><Button component={Link} to="/projects" size="small" endIcon={<ArrowForwardRounded />}>Ver todos</Button></div><div className="divide-y divide-border">{projects.slice(0, 5).map((project) => { const projectTasks = tasks.filter((task) => task.projectId === project.id); const projectDone = projectTasks.filter((task) => task.status === 'done').length; const value = projectTasks.length ? Math.round(projectDone / projectTasks.length * 100) : 0; return <Link className="grid gap-3 p-4 hover:bg-surface-elevated sm:grid-cols-[1fr_180px] sm:items-center" to={`/projects/${project.id}`} key={project.id}><div><p className="font-medium">{project.name}</p><p className="text-xs text-text-muted">{project.description || project.status}</p></div><div><div className="mb-1 flex justify-between text-xs text-text-muted"><span>Avance</span><strong>{value}%</strong></div><LinearProgress variant="determinate" value={value} /></div></Link>; })}</div></section>
      <section className="workspace-card rounded-lg p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Tareas bloqueadas</h2><Button component={Link} to="/tasks" size="small">Tablero</Button></div><div className="space-y-3">{blocked.slice(0, 5).map((task) => <button className="w-full rounded-md border border-border p-3 text-left hover:bg-surface-elevated" onClick={() => navigate('/tasks')} key={task.id}><div className="flex gap-2"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{task.title}</p><p className="text-xs text-text-muted">{projectName(task.projectId)}</p></div><PriorityChip priority={task.priority} /><TaskStatusChip status={task.status} /></div></button>)}{!blocked.length ? <p className="py-6 text-center text-sm text-text-muted">No hay tareas bloqueadas.</p> : null}</div></section>
    </div>
  </div>;
};
export default HomePageContent;
