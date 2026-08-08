import * as React from 'react';
import { LinearProgress } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { ProjectRoleChip } from '@/components/project-platform/ProjectBadges';
import { getProjectTasks, projects } from '@/lib/project-platform-demo';

const ReportsPageContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Reportes"
        description="Vista de solo lectura para avance, entregables y riesgos. Pensada para clientes, viewers y perfiles con reports.read."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {projects.map((project) => {
          const projectTasks = getProjectTasks(project.id);
          const blocked = projectTasks.filter(
            (task) => task.status === 'blocked',
          ).length;

          return (
            <SectionCard
              key={project.id}
              title={project.name}
              description={project.client}
              action={<ProjectRoleChip role={project.contextualRole} />}
            >
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-text-secondary">Avance</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                  />
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-surface-elevated p-3">
                    <dt className="text-text-muted">Tareas</dt>
                    <dd className="text-lg font-semibold text-text">
                      {projectTasks.length}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-surface-elevated p-3">
                    <dt className="text-text-muted">Bloqueadas</dt>
                    <dd className="text-lg font-semibold text-text">
                      {blocked}
                    </dd>
                  </div>
                </dl>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
};

class ReportsPage extends React.Component {
  render() {
    return <ReportsPageContent />;
  }
}

export default ReportsPage;
