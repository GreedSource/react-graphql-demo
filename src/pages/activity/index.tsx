import * as React from 'react';
import { Alert, MenuItem, TextField } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuditLogs } from '@/hooks/audit.hook';
import { getApolloErrorMessage } from '@/lib/graphql';

const ActivityPageContent: React.FC = () => {
  const auditQuery = useAuditLogs(100);
  const logs = auditQuery.data?.auditLogs?.data ?? [];
  const [status, setStatus] = React.useState('all');
  const [module, setModule] = React.useState('all');
  const modules = [...new Set(logs.map((log) => log.module))];
  const filtered = logs.filter((log) => (status === 'all' || log.status === status) && (module === 'all' || log.module === module));
  return <div className="space-y-6">
    <PageHeader eyebrow="Actividad" title="Auditoria" description="Consulta las ultimas 100 decisiones y operaciones registradas por el backend." />
    {auditQuery.error ? <Alert severity="error">{getApolloErrorMessage(auditQuery.error)}</Alert> : null}
    <div className="flex gap-3"><TextField select size="small" label="Modulo" value={module} onChange={(event) => setModule(event.target.value)} sx={{ minWidth: 170 }}><MenuItem value="all">Todos</MenuItem>{modules.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField><TextField select size="small" label="Estado" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 150 }}><MenuItem value="all">Todos</MenuItem><MenuItem value="success">Success</MenuItem><MenuItem value="denied">Denied</MenuItem></TextField></div>
    <div className="workspace-card overflow-hidden rounded-lg divide-y divide-border">{filtered.map((log) => <details className="group p-4" key={log.id}><summary className="flex cursor-pointer list-none items-start justify-between gap-3"><div><p className="font-medium">{log.module}.{log.action}</p><p className="mt-1 text-xs text-text-muted">Usuario {log.userId || 'sistema'} · {log.resourceType || 'recurso'} {log.resourceId || ''}</p></div><div className="text-right"><span className={`rounded px-2 py-1 text-xs font-semibold ${log.status === 'success' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>{log.status}</span><p className="mt-2 text-xs text-text-muted">{log.createdAt}</p></div></summary>{log.metadata ? <pre className="mt-3 overflow-x-auto rounded bg-surface-elevated p-3 text-xs text-text-secondary">{JSON.stringify(log.metadata, null, 2)}</pre> : null}</details>)}</div>
  </div>;
};
export default ActivityPageContent;
