import * as React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Alert, LinearProgress } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import {
  PriorityChip,
  ProjectRoleChip,
  ProjectStatusChip,
  TaskStatusChip,
} from '@/components/project-platform/ProjectBadges';
import {
  getProject,
  getProjectAuditEvents,
  getProjectTasks,
} from '@/lib/project-platform-demo';

const ProjectDetailPageContent: React.FC = () => {
  const { projectId } = useParams();
  const project = projectId ? getProject(projectId) : undefined;

  if (!project) {
    return <Navigate replace to="/not-found" />;
  }

  const projectTasks = getProjectTasks(project.id);
  const auditEvents = getProjectAuditEvents(project.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project detail"
        title={project.name}
        description={project.summary}
        actions={
          <div className="flex flex-wrap gap-2">
            <ProjectRoleChip role={project.contextualRole} />
            <ProjectStatusChip status={project.status} />
          </div>
        }
      />

      <Alert severity="info">
        Rol contextual actual: {project.contextualRole}. El backend todavia
        puede denegar acciones por ownership o autorizacion por recurso.
      </Alert>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Informacion" description={project.client}>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Avance</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <LinearProgress variant="determinate" value={project.progress} />
            </div>
            <p className="text-sm text-text-secondary">
              Fecha objetivo: {project.dueDate}
            </p>
            <div className="flex flex-wrap gap-2">
              <PermissionAction permission="projects.update">
                Editar proyecto
              </PermissionAction>
              <PermissionAction permission="tasks.create">
                Crear tarea
              </PermissionAction>
              <PermissionAction permission="members.manage">
                Gestionar miembros
              </PermissionAction>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Miembros" badge={project.members.length}>
          <div className="space-y-3">
            {project.members.map((member) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                key={member.id}
              >
                <div>
                  <p className="font-medium text-text">{member.name}</p>
                  <p className="text-xs text-text-muted">{member.email}</p>
                </div>
                <ProjectRoleChip role={member.projectRole} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Tareas" badge={projectTasks.length}>
          <div className="space-y-3">
            {projectTasks.map((task) => (
              <div className="rounded-lg border border-border p-3" key={task.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text">{task.title}</p>
                    <p className="text-xs text-text-muted">
                      {task.assignee} · vence {task.dueDate}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PriorityChip priority={task.priority} />
                    <TaskStatusChip status={task.status} />
                  </div>
                </div>
                {task.blockedReason ? (
                  <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                    {task.blockedReason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Actividad y reportes">
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-text">
                Reporte de avance disponible
              </p>
              <p className="text-sm text-text-secondary">
                Visible para clientes y viewers con reports.read.
              </p>
            </div>
            {auditEvents.map((event) => (
              <div className="rounded-lg border border-border p-4" key={event.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-text">{event.action}</p>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      event.status === 'success'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-500/15 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {event.actor} · {event.createdAt}
                </p>
                {event.metadata?.reason ? (
                  <p className="mt-2 text-sm text-text-secondary">
                    {event.metadata.reason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

class ProjectDetailPage extends React.Component {
  render() {
    return <ProjectDetailPageContent />;
  }
}

export default ProjectDetailPage;
