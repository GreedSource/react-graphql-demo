import * as React from 'react';
import { Button, MenuItem, TextField } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import {
  PriorityChip,
  TaskStatusChip,
} from '@/components/project-platform/ProjectBadges';
import {
  getProjectName,
  priorityLabels,
  projects,
  tasks,
  taskStatusLabels,
} from '@/lib/project-platform-demo';

const TasksPageContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title="Tareas"
        description="Lista filtrable por proyecto, estado, prioridad y asignado. Las mutaciones deben manejar FORBIDDEN cuando el recurso no pertenece al contexto permitido."
        actions={
          <PermissionAction permission="tasks.create" variant="contained">
            Crear tarea
          </PermissionAction>
        }
      />

      <SectionCard title="Filtros" variant="outlined">
        <div className="grid gap-4 md:grid-cols-4">
          <TextField label="Proyecto" select size="small" defaultValue="all">
            <MenuItem value="all">Todos</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Estado" select size="small" defaultValue="all">
            <MenuItem value="all">Todos</MenuItem>
            {Object.entries(taskStatusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Prioridad" select size="small" defaultValue="all">
            <MenuItem value="all">Todas</MenuItem>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Asignado" size="small" placeholder="Nombre" />
        </div>
      </SectionCard>

      <SectionCard title="Backlog operativo" badge={tasks.length}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div className="rounded-lg border border-border p-4" key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-text">{task.title}</p>
                  <p className="text-sm text-text-secondary">
                    {getProjectName(task.projectId)} · {task.assignee}
                  </p>
                  <p className="text-xs text-text-muted">Vence {task.dueDate}</p>
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
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <PermissionAction permission="tasks.assign">
                  Asignar
                </PermissionAction>
                <PermissionAction permission="tasks.update">
                  Editar
                </PermissionAction>
                <PermissionAction permission="tasks.complete">
                  Completar
                </PermissionAction>
                <Button size="small" variant="text">
                  Ver detalle
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

class TasksPage extends React.Component {
  render() {
    return <TasksPageContent />;
  }
}

export default TasksPage;
