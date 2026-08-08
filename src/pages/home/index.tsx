import * as React from 'react';
import { Assignment, History, Warning, Workspaces } from '@mui/icons-material';
import { Alert, Button, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { useProfileQuery } from '@/hooks/auth.hook';
import { usePermission } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StateCard } from '@/components/ui/StateCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import {
  ProjectRoleChip,
  ProjectStatusChip,
  TaskStatusChip,
} from '@/components/project-platform/ProjectBadges';
import {
  auditEvents,
  getProjectName,
  projects,
  tasks,
} from '@/lib/project-platform-demo';

const HomePageContent: React.FC = () => {
  const profileQuery = useProfileQuery();
  const { can } = usePermission();

  const profile = profileQuery.data?.profile?.data;
  const assignedTasks = tasks.filter((task) => task.assignee === 'Joel Alvarez');
  const blockedTasks = tasks.filter((task) => task.status === 'blocked');
  const visibleProjects = can('projects.read') ? projects : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project platform"
        title={`Hola${profile ? `, ${profile.name}` : ''}`}
        description="Gestiona proyectos, tareas, miembros y auditoria con acciones condicionadas por permisos globales y contexto de proyecto."
        actions={
          <div className="flex flex-wrap gap-3">
            <PermissionAction permission="projects.create" variant="contained">
              Nuevo proyecto
            </PermissionAction>
            <Button component={Link} to="/projects" variant="outlined">
              Ver proyectos
            </Button>
          </div>
        }
      />

      {profileQuery.error ? (
        <Alert severity="warning">
          {getApolloErrorMessage(profileQuery.error)}
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        <StateCard title={String(visibleProjects.length)} description="Proyectos activos" icon={<Workspaces />} />
        <StateCard title={String(assignedTasks.length)} description="Tareas asignadas" icon={<Assignment />} />
        <StateCard title={String(blockedTasks.length)} description="Atrasadas o bloqueadas" icon={<Warning />} />
        <StateCard title={String(auditEvents.length)} description="Actividad reciente" icon={<History />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          title="Proyectos por contexto"
          description="El mismo usuario conserva la sesion, pero cambia sus capacidades segun el proyecto seleccionado."
        >
          <div className="space-y-3">
            {visibleProjects.map((project) => (
              <Link
                className="block rounded-lg border border-border p-4 hover:border-accent"
                key={project.id}
                to={`/projects/${project.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-text">{project.name}</h2>
                    <p className="text-sm text-text-secondary">{project.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ProjectRoleChip role={project.contextualRole} />
                    <ProjectStatusChip status={project.status} />
                  </div>
                </div>
                <LinearProgress className="mt-4" variant="determinate" value={project.progress} />
              </Link>
            ))}
            {visibleProjects.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No tienes permiso projects.read para consultar proyectos.
              </p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Tareas y auditoria"
          description="Acciones ejecutables y denegadas deben seguir manejando FORBIDDEN desde GraphQL."
        >
          <div className="space-y-4">
            {assignedTasks.map((task) => (
              <div className="rounded-lg border border-border p-3" key={task.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text">{task.title}</p>
                    <p className="text-xs text-text-muted">{getProjectName(task.projectId)}</p>
                  </div>
                  <TaskStatusChip status={task.status} />
                </div>
              </div>
            ))}
            <PermissionAction permission="tasks.complete">
              Completar seleccionada
            </PermissionAction>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

class HomePage extends React.Component {
  render() {
    return <HomePageContent />;
  }
}

export default HomePage;
