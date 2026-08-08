import * as React from 'react';
import { Button, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import {
  ProjectRoleChip,
  ProjectStatusChip,
} from '@/components/project-platform/ProjectBadges';
import { projects } from '@/lib/project-platform-demo';

const ProjectsPageContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Proyectos"
        description="Lista de proyectos visibles para el usuario actual. Las acciones dependen de projects.* y del contexto autorizado por backend."
        actions={
          <PermissionAction permission="projects.create" variant="contained">
            Crear proyecto
          </PermissionAction>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {projects.map((project) => (
          <SectionCard
            key={project.id}
            title={project.name}
            description={project.client}
            action={<ProjectStatusChip status={project.status} />}
          >
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">{project.summary}</p>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
                  <span>Avance</span>
                  <span>{project.progress}%</span>
                </div>
                <LinearProgress variant="determinate" value={project.progress} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ProjectRoleChip role={project.contextualRole} />
                <span className="text-xs text-text-muted">
                  Entrega {project.dueDate}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  component={Link}
                  size="small"
                  to={`/projects/${project.id}`}
                  variant="contained"
                >
                  Entrar
                </Button>
                <PermissionAction permission="projects.update">
                  Editar
                </PermissionAction>
                <PermissionAction permission="projects.archive">
                  Archivar
                </PermissionAction>
                <PermissionAction permission="projects.delete">
                  Eliminar
                </PermissionAction>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
};

class ProjectsPage extends React.Component {
  render() {
    return <ProjectsPageContent />;
  }
}

export default ProjectsPage;
