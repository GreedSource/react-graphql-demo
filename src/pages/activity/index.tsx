import * as React from 'react';
import { Alert } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { auditEvents, getProjectName } from '@/lib/project-platform-demo';

const ActivityPageContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity / Audit Logs"
        title="Auditoria"
        description="Registro de acciones success y denied. Las denegaciones muestran metadata.reason para explicar decisiones de autorizacion."
      />

      <Alert severity="info">
        Esta ruta se protege con activity.read. En UNAUTHORIZED se debe renovar
        token o volver a login; FORBIDDEN mantiene al usuario en contexto.
      </Alert>

      <SectionCard title="Eventos recientes" badge={auditEvents.length}>
        <div className="space-y-3">
          {auditEvents.map((event) => (
            <div className="rounded-lg border border-border p-4" key={event.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-text">{event.action}</p>
                  <p className="text-sm text-text-secondary">
                    {getProjectName(event.projectId)} · {event.actor}
                  </p>
                  <p className="text-xs text-text-muted">{event.createdAt}</p>
                </div>
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
              {event.metadata?.reason ? (
                <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                  {event.metadata.reason}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

class ActivityPage extends React.Component {
  render() {
    return <ActivityPageContent />;
  }
}

export default ActivityPage;
