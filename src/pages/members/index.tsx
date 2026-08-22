import * as React from 'react';
import { GroupRounded, PeopleAltRounded, PersonAddRounded, ShieldRounded } from '@mui/icons-material';
import { Alert, Avatar, Button, Chip, MenuItem, TextField } from '@mui/material';
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

  const selectedProject = projects.find((project) => project.id === projectId);
  return <div className="space-y-7">
    <PageHeader eyebrow="Equipos" title="Miembros del proyecto" description="Administra quién participa en cada proyecto y qué alcance tiene su rol." actions={<PermissionAction permission="members.manage" variant="contained" startIcon={<PersonAddRounded />} onClick={openCreate}>Agregar miembro</PermissionAction>} />
    {(projectsQuery.error || membersQuery.error || usersQuery.error) ? <Alert severity="error">{getApolloErrorMessage(projectsQuery.error || membersQuery.error || usersQuery.error)}</Alert> : null}
    <section className="workspace-card rounded-2xl border p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"><GroupRounded /></span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">Proyecto activo</p><p className="mt-0.5 font-semibold text-text">{selectedProject?.name || 'Selecciona un proyecto'}</p></div></div><TextField select size="small" label="Cambiar proyecto" value={projectId} onChange={(event) => setProjectId(event.target.value)} sx={{ minWidth: { xs: '100%', sm: 290 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>{projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}</TextField></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-surface-elevated p-3"><PeopleAltRounded className="text-accent" fontSize="small" /><p className="mt-2 text-2xl font-semibold text-text">{members.length}</p><p className="text-xs text-text-muted">Miembros</p></div><div className="rounded-xl bg-surface-elevated p-3"><ShieldRounded className="text-sky-500" fontSize="small" /><p className="mt-2 text-2xl font-semibold text-text">{roles.length}</p><p className="text-xs text-text-muted">Roles activos</p></div><div className="hidden rounded-xl bg-surface-elevated p-3 sm:block"><GroupRounded className="text-emerald-500" fontSize="small" /><p className="mt-2 text-2xl font-semibold text-text">{selectedProject?.status === 'active' ? 'Activo' : selectedProject?.status || '—'}</p><p className="text-xs text-text-muted">Estado del proyecto</p></div></div>
    </section>
    <section className="space-y-3">
      <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold tracking-tight text-text">Personas con acceso</h2><p className="text-sm text-text-secondary">Roles contextuales asignados en este proyecto.</p></div><span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{members.length} {members.length === 1 ? 'persona' : 'personas'}</span></div>
      {members.length ? <div className="grid gap-3 lg:grid-cols-2">{members.map((member) => <article className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-surface-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-md sm:flex-row sm:items-center" key={member.id}><div className="flex min-w-0 flex-1 items-center gap-3"><Avatar sx={{ width: 42, height: 42, bgcolor: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700 }}>{userName(member.userId).slice(0, 1)}</Avatar><div className="min-w-0"><p className="truncate font-semibold text-text">{userName(member.userId)}</p><p className="truncate text-xs text-text-muted">ID: {member.userId}</p></div></div><Chip icon={<ShieldRounded sx={{ fontSize: 15 }} />} label={member.projectRole.name} size="small" sx={{ alignSelf: 'flex-start', bgcolor: 'var(--accent-soft)', color: 'var(--accent)', '& .MuiChip-icon': { color: 'var(--accent)' } }} /><div className="flex gap-2 sm:shrink-0"><PermissionAction permission="members.manage" onClick={() => openEdit(member)}>Cambiar rol</PermissionAction><PermissionAction permission="members.manage" onClick={() => setRemoveTarget(member)}>Remover</PermissionAction></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-border p-10 text-center"><PeopleAltRounded className="text-text-muted" fontSize="large" /><p className="mt-3 font-semibold text-text">Este proyecto aún no tiene miembros</p><p className="mt-1 text-sm text-text-secondary">Agrega personas para comenzar a distribuir responsabilidades.</p></div>}
    </section>
    <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={selectedMember ? 'Cambiar rol contextual' : 'Agregar miembro'} actions={<><Button onClick={() => setDialogOpen(false)}>Cancelar</Button><Button variant="contained" disabled={!projectRoleId || (!selectedMember && !userId) || addState.loading || updateState.loading} onClick={() => void save()}>Guardar</Button></>}>
      {!selectedMember ? <TextField select label="Usuario" value={userId} onChange={(event) => setUserId(event.target.value)}>{users.filter((user) => !members.some((member) => member.userId === user.id)).map((user) => <MenuItem key={user.id} value={user.id}>{user.name} {user.lastname}</MenuItem>)}</TextField> : null}
      {roles.length ? <TextField select label="Rol contextual" value={projectRoleId} onChange={(event) => setProjectRoleId(event.target.value)}>{roles.map((role) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}</TextField> : <TextField label="ID del rol contextual" value={projectRoleId} onChange={(event) => setProjectRoleId(event.target.value)} helperText="El contrato GraphQL no expone un catalogo de roles de proyecto; ingresa el ID proporcionado por backend." />}
    </FormDialog>
    <ConfirmDialog open={Boolean(removeTarget)} title="Remover miembro" description={`Se removera a ${removeTarget ? userName(removeTarget.userId) : ''} del proyecto.`} onClose={() => setRemoveTarget(null)} onConfirm={() => void remove()} destructive loading={removeState.loading} />
  </div>;
};
export default MembersPageContent;
