import * as React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { PriorityChip, TaskStatusChip } from '@/components/project-platform/ProjectBadges';
import { FormDialog } from '@/components/ui/FormDialog';
import { useProject, useProjectMutations } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { useProjectMembers } from '@/hooks/member.hook';
import { useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';

const ProjectDetailPageContent: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProject(projectId);
  const tasksQuery = useTasks(projectId);
  const membersQuery = useProjectMembers(projectId);
  const usersQuery = useUsers();
  const { updateProject, updateState } = useProjectMutations();
  const project = projectQuery.data?.project?.data;
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  const members = membersQuery.data?.projectMembers?.data ?? [];
  const users = usersQuery.data?.users?.data ?? [];
  const [editOpen, setEditOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  if (!projectId) return <Navigate replace to="/projects" />;
  const error = projectQuery.error || tasksQuery.error || membersQuery.error;
  const userName = (id: string) => { const user = users.find((item) => item.id === id); return user ? `${user.name} ${user.lastname}` : id; };
  const openEdit = () => { if (!project) return; setName(project.name); setDescription(project.description ?? ''); setEditOpen(true); };
  const save = async () => { if (!project || !name.trim()) return; try { const response = await updateProject({ id: project.id, name: name.trim(), description }); toast.success(response.message || 'Proyecto actualizado.'); setEditOpen(false); } catch (requestError) { toast.error(getApolloErrorMessage(requestError)); } };

  return <div className="space-y-6">
    <PageHeader eyebrow="Proyecto" title={project?.name ?? 'Cargando proyecto'} description={project?.description || 'Sin descripcion.'} actions={<div className="flex gap-2"><PermissionAction permission="projects.update" onClick={openEdit}>Editar</PermissionAction><PermissionAction permission="tasks.create" variant="contained" onClick={() => navigate(`/tasks?create=1&projectId=${projectId}`)}>Crear tarea</PermissionAction></div>} />
    {error ? <Alert severity="error">{getApolloErrorMessage(error)}</Alert> : null}
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard title="Tareas" badge={tasks.length}><div className="divide-y divide-border">{tasks.map((task) => <div className="flex flex-wrap items-center gap-3 py-3" key={task.id}><div className="min-w-0 flex-1"><p className="font-medium">{task.title}</p><p className="text-xs text-text-muted">{task.assigneeId ? userName(task.assigneeId) : 'Sin asignar'} · {task.dueDate || 'Sin fecha'}</p></div><PriorityChip priority={task.priority} /><TaskStatusChip status={task.status} /></div>)}{!tasks.length ? <p className="py-6 text-center text-sm text-text-muted">No hay tareas.</p> : null}</div></SectionCard>
      <SectionCard title="Miembros" badge={members.length} action={<Button size="small" onClick={() => navigate('/members')}>Administrar</Button>}><div className="divide-y divide-border">{members.map((member) => <div className="flex items-center justify-between gap-3 py-3" key={member.id}><div><p className="text-sm font-medium">{userName(member.userId)}</p><p className="text-xs text-text-muted">{member.userId}</p></div><span className="rounded bg-accent-soft px-2 py-1 text-xs text-accent">{member.projectRole.name}</span></div>)}</div></SectionCard>
    </div>
    <FormDialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar proyecto" actions={<><Button onClick={() => setEditOpen(false)}>Cancelar</Button><Button variant="contained" disabled={!name.trim() || updateState.loading} onClick={() => void save()}>Guardar</Button></>}><TextField autoFocus label="Nombre" value={name} onChange={(event) => setName(event.target.value)} /><TextField label="Descripcion" value={description} onChange={(event) => setDescription(event.target.value)} multiline minRows={3} /><TextField select label="Estado" value={project?.status ?? 'active'} disabled><MenuItem value={project?.status ?? 'active'}>{project?.status}</MenuItem></TextField></FormDialog>
  </div>;
};
export default ProjectDetailPageContent;
