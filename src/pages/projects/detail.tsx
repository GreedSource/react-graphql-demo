import * as React from 'react';
import { Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { PriorityChip, TaskStatusChip } from '@/components/project-platform/ProjectBadges';
import { SectionCard } from '@/components/ui/SectionCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import { formatDate } from '@/lib/date-format';
import { useProjectDetailPage } from './hooks/useProjectDetailPage';

const ProjectDetailPageContent: React.FC = () => {
  const {
    projectId,
    project,
    tasks,
    members,
    error,
    updateState,
    editOpen,
    setEditOpen,
    name,
    setName,
    description,
    setDescription,
    userName,
    openEdit,
    save,
    openTaskCreation,
    openMembersPage,
  } = useProjectDetailPage();

  if (!projectId) return <Navigate replace to="/projects" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Proyecto"
        title={project?.name ?? 'Cargando proyecto'}
        description={project?.description || 'Sin descripción.'}
        actions={
          <div className="flex gap-2">
            <PermissionAction permission="projects.update" onClick={openEdit}>
              Editar
            </PermissionAction>
            <PermissionAction
              permission="tasks.create"
              variant="contained"
              onClick={openTaskCreation}
            >
              Crear tarea
            </PermissionAction>
          </div>
        }
      />

      {error ? (
        <Alert severity="error">{getApolloErrorMessage(error)}</Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Tareas" badge={tasks.length}>
          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <div
                className="flex flex-wrap items-center gap-3 py-3"
                key={task.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-text-muted">
                    {task.assigneeId
                      ? userName(task.assigneeId)
                      : 'Sin asignar'}{' '}
                    · {formatDate(task.dueDate)}
                  </p>
                </div>
                <PriorityChip priority={task.priority} />
                <TaskStatusChip status={task.status} />
              </div>
            ))}
            {!tasks.length ? (
              <p className="py-6 text-center text-sm text-text-muted">
                No hay tareas todavía.
              </p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Miembros"
          badge={members.length}
          action={
            <Button size="small" onClick={openMembersPage}>
              Administrar
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div
                className="flex items-center justify-between gap-3 py-3"
                key={member.id}
              >
                <div>
                  <p className="text-sm font-medium">{userName(member.userId)}</p>
                  <p className="text-xs text-text-muted">{member.userId}</p>
                </div>
                <span className="rounded bg-accent-soft px-2 py-1 text-xs text-accent">
                  {member.projectRole.name}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <FormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar proyecto"
        actions={
          <>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!name.trim() || updateState.loading}
              onClick={() => void save()}
            >
              Guardar
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          minRows={3}
        />
        <TextField select label="Estado" value={project?.status ?? 'active'} disabled>
          <MenuItem value={project?.status ?? 'active'}>
            {project?.status}
          </MenuItem>
        </TextField>
      </FormDialog>
    </div>
  );
};

export default ProjectDetailPageContent;
