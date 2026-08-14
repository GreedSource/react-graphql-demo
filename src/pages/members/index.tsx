import * as React from 'react';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { FormDialog } from '@/components/ui/FormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useProjects } from '@/hooks/project.hook';
import { useProjectMembers, useProjectMemberMutations } from '@/hooks/member.hook';
import { useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { ProjectMemberEntity } from '@/types/project-platform';

const MembersPageContent: React.FC = () => {
  const projectsQuery = useProjects();
  const usersQuery = useUsers();
  const projects = React.useMemo(() => projectsQuery.data?.projects?.data ?? [], [projectsQuery.data]);
  const users = usersQuery.data?.users?.data ?? [];
  const [projectId, setProjectId] = React.useState('');
  const membersQuery = useProjectMembers(projectId);
  const { addMember, updateMemberRole, removeMember, addState, updateState, removeState } = useProjectMemberMutations(projectId);
  const members = membersQuery.data?.projectMembers?.data ?? [];
  const roles = Array.from(new Map(members.map((member) => [member.projectRole.id, member.projectRole])).values());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<ProjectMemberEntity | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<ProjectMemberEntity | null>(null);
  const [userId, setUserId] = React.useState('');
  const [projectRoleId, setProjectRoleId] = React.useState('');
  React.useEffect(() => { if (!projectId && projects.length) setProjectId(projects[0].id); }, [projectId, projects]);
  const openCreate = () => { setSelectedMember(null); setUserId(''); setProjectRoleId(roles[0]?.id ?? ''); setDialogOpen(true); };
  const openEdit = (member: ProjectMemberEntity) => { setSelectedMember(member); setUserId(member.userId); setProjectRoleId(member.projectRoleId); setDialogOpen(true); };
  const save = async () => { try { const response = selectedMember ? await updateMemberRole({ id: selectedMember.id, projectRoleId }) : await addMember({ projectId, userId, projectRoleId }); toast.success(response.message || 'Miembro actualizado.'); setDialogOpen(false); } catch (error) { toast.error(getApolloErrorMessage(error)); } };
  const remove = async () => { if (!removeTarget) return; try { const response = await removeMember(removeTarget.id); toast.success(response.message || 'Miembro removido.'); setRemoveTarget(null); } catch (error) { toast.error(getApolloErrorMessage(error)); } };
  const userName = (id: string) => { const user = users.find((item) => item.id === id); return user ? `${user.name} ${user.lastname}` : id; };

  return <div className="space-y-6">
    <PageHeader eyebrow="Equipos" title="Miembros del proyecto" description="Administra usuarios y roles contextuales con datos del backend." actions={<PermissionAction permission="members.manage" variant="contained" onClick={openCreate}>Agregar miembro</PermissionAction>} />
    {(projectsQuery.error || membersQuery.error || usersQuery.error) ? <Alert severity="error">{getApolloErrorMessage(projectsQuery.error || membersQuery.error || usersQuery.error)}</Alert> : null}
    <TextField select size="small" label="Proyecto" value={projectId} onChange={(event) => setProjectId(event.target.value)} sx={{ minWidth: 280 }}>{projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}</TextField>
    <div className="workspace-card overflow-hidden rounded-lg divide-y divide-border">
      {members.map((member) => <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center" key={member.id}><div className="min-w-0 flex-1"><p className="font-medium">{userName(member.userId)}</p><p className="text-xs text-text-muted">{member.projectRole.name}</p></div><PermissionAction permission="members.manage" onClick={() => openEdit(member)}>Cambiar rol</PermissionAction><PermissionAction permission="members.manage" onClick={() => setRemoveTarget(member)}>Remover</PermissionAction></div>)}
      {!members.length && !membersQuery.loading ? <p className="p-8 text-center text-sm text-text-muted">Este proyecto no tiene miembros.</p> : null}
    </div>
    <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={selectedMember ? 'Cambiar rol contextual' : 'Agregar miembro'} actions={<><Button onClick={() => setDialogOpen(false)}>Cancelar</Button><Button variant="contained" disabled={!projectRoleId || (!selectedMember && !userId) || addState.loading || updateState.loading} onClick={() => void save()}>Guardar</Button></>}>
      {!selectedMember ? <TextField select label="Usuario" value={userId} onChange={(event) => setUserId(event.target.value)}>{users.filter((user) => !members.some((member) => member.userId === user.id)).map((user) => <MenuItem key={user.id} value={user.id}>{user.name} {user.lastname}</MenuItem>)}</TextField> : null}
      {roles.length ? <TextField select label="Rol contextual" value={projectRoleId} onChange={(event) => setProjectRoleId(event.target.value)}>{roles.map((role) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}</TextField> : <TextField label="ID del rol contextual" value={projectRoleId} onChange={(event) => setProjectRoleId(event.target.value)} helperText="El contrato GraphQL no expone un catalogo de roles de proyecto; ingresa el ID proporcionado por backend." />}
    </FormDialog>
    <ConfirmDialog open={Boolean(removeTarget)} title="Remover miembro" description={`Se removera a ${removeTarget ? userName(removeTarget.userId) : ''} del proyecto.`} onClose={() => setRemoveTarget(null)} onConfirm={() => void remove()} destructive loading={removeState.loading} />
  </div>;
};
export default MembersPageContent;
