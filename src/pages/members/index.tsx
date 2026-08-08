import * as React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { ProjectRoleChip } from '@/components/project-platform/ProjectBadges';
import { projects } from '@/lib/project-platform-demo';

const MembersPageContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teams / Members"
        title="Miembros por proyecto"
        description="Administra membresias y roles contextuales. Los roles por proyecto no reemplazan permisos globales; se evalua el contexto del recurso."
        actions={
          <PermissionAction permission="members.manage" variant="contained">
            Agregar miembro
          </PermissionAction>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {projects.map((project) => (
          <SectionCard
            key={project.id}
            title={project.name}
            description={`Tu contexto: ${project.contextualRole}`}
            badge={project.members.length}
          >
            <div className="space-y-3">
              {project.members.map((member) => (
                <div
                  className="rounded-lg border border-border p-3"
                  key={member.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-text">{member.name}</p>
                      <p className="text-xs text-text-muted">{member.email}</p>
                    </div>
                    <ProjectRoleChip role={member.projectRole} />
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <PermissionAction permission="members.manage">
                      Cambiar rol
                    </PermissionAction>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
};

class MembersPage extends React.Component {
  render() {
    return <MembersPageContent />;
  }
}

export default MembersPage;
