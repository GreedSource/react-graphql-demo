import * as React from 'react';
import { AddBusinessRounded, ArrowForwardRounded, CheckCircleRounded, GroupAddRounded, GroupsRounded, PeopleAltRounded } from '@mui/icons-material';
import { Alert, Button, Chip, MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { OrganizationSelector } from '@/components/crm/OrganizationSelector';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { useCrmAdministration, useCrmOrganization, useCrmTeams } from '@/hooks/crm.hook';
import { useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';

const slugify = (value: string) => value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CRMAdministrationPage: React.FC = () => {
  const { organizationId, setOrganizationId } = useCrmOrganization();
  const teamsQuery = useCrmTeams(organizationId);
  const usersQuery = useUsers();
  const { createOrganization, createTeam, addMember, organizationState, teamState, memberState } = useCrmAdministration();
  const [organizationName, setOrganizationName] = React.useState('');
  const [organizationSlug, setOrganizationSlug] = React.useState('');
  const [teamName, setTeamName] = React.useState('');
  const [teamDescription, setTeamDescription] = React.useState('');
  const [teamId, setTeamId] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [role, setRole] = React.useState('member');
  const [scope, setScope] = React.useState('TEAM');
  const teams = teamsQuery.data?.crmTeams.data ?? [];
  const users = usersQuery.data?.users.data ?? [];

  const saveOrganization = async () => {
    try {
      const response = await createOrganization(organizationName.trim(), organizationSlug.trim());
      setOrganizationId(response.data.id);
      setOrganizationName(''); setOrganizationSlug('');
      toast.success(response.message || 'Organización creada.');
    } catch (error) { toast.error(getApolloErrorMessage(error)); }
  };
  const saveTeam = async () => {
    try {
      const response = await createTeam(organizationId, teamName.trim(), teamDescription.trim() || undefined);
      setTeamId(response.data.id); setTeamName(''); setTeamDescription('');
      toast.success(response.message || 'Equipo creado.');
    } catch (error) { toast.error(getApolloErrorMessage(error)); }
  };
  const saveMember = async () => {
    try {
      const response = await addMember(teamId, userId, role.trim(), scope);
      setUserId('');
      toast.success(response.message || 'Miembro agregado.');
    } catch (error) { toast.error(getApolloErrorMessage(error)); }
  };

  const setupSteps = [Boolean(organizationId), Boolean(organizationId && teams.length), Boolean(teamId && userId)];

  return <div className="space-y-7">
    <PageHeader eyebrow="CRM · Configuración" title="Configura tu operación" description="Organiza el espacio comercial, define equipos y asigna el alcance correcto a cada persona." actions={<OrganizationSelector value={organizationId} onChange={(value) => { setOrganizationId(value); setTeamId(''); }} />} />
    <section className="workspace-card overflow-hidden rounded-2xl border p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Configuración guiada</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-text">Construye tu estructura CRM</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">Completa estos pasos para que tu equipo pueda trabajar con datos y permisos contextuales.</p></div>
        <div className="flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-sm font-semibold text-accent"><CheckCircleRounded fontSize="small" /> {setupSteps.filter(Boolean).length} de 3 pasos</div>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">{['Organización', 'Equipo', 'Miembros'].map((label, index) => <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${setupSteps[index] ? 'bg-emerald-500/10' : 'bg-surface-elevated'}`} key={label}><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${setupSteps[index] ? 'bg-emerald-500 text-white' : 'bg-surface-card text-text-muted'}`}>{setupSteps[index] ? '✓' : index + 1}</span><span className={`text-sm font-medium ${setupSteps[index] ? 'text-emerald-700 dark:text-emerald-300' : 'text-text-secondary'}`}>{label}</span>{index < 2 ? <ArrowForwardRounded className="ml-auto hidden text-text-muted sm:block" fontSize="small" /> : null}</div>)}</div>
    </section>
    <div className="grid gap-5 xl:grid-cols-3">
      <SectionCard title="Nueva organización" description="El contenedor principal de tu operación." icon={<AddBusinessRounded />} className="border-t-4 border-t-indigo-400">
        <div className="grid gap-5"><TextField fullWidth label="Nombre de la organización" placeholder="Ej. Acme Corporation" value={organizationName} onChange={(event) => { const value = event.target.value; setOrganizationName(value); setOrganizationSlug(slugify(value)); }} helperText="Usa el nombre que verá tu equipo en el CRM." /><TextField fullWidth label="Slug" placeholder="acme-corporation" value={organizationSlug} onChange={(event) => setOrganizationSlug(slugify(event.target.value))} helperText="Identificador único, en minúsculas y sin espacios." /><Button fullWidth variant="contained" disabled={!organizationName.trim() || !organizationSlug || organizationState.loading} onClick={() => void saveOrganization()}>Crear organización</Button></div>
      </SectionCard>
      <SectionCard title="Nuevo equipo" description="Divide la operación por áreas o territorios." icon={<GroupsRounded />} className="border-t-4 border-t-sky-400">
        {!organizationId ? <Alert severity="info">Selecciona o crea una organización primero.</Alert> : <div className="grid gap-5"><TextField fullWidth label="Nombre del equipo" placeholder="Ej. Ventas Norte" value={teamName} onChange={(event) => setTeamName(event.target.value)} helperText="Elige un nombre fácil de reconocer." /><TextField fullWidth multiline minRows={3} label="Descripción" placeholder="Qué función cumple este equipo..." value={teamDescription} onChange={(event) => setTeamDescription(event.target.value)} /><Button fullWidth variant="contained" disabled={!teamName.trim() || teamState.loading} onClick={() => void saveTeam()}>Crear equipo</Button></div>}
      </SectionCard>
      <SectionCard title="Agregar miembro" description="Asigna usuario, rol operativo y alcance." icon={<GroupAddRounded />} className="border-t-4 border-t-emerald-400">
        {!organizationId || teams.length === 0 ? <Alert severity="info">La organización necesita al menos un equipo.</Alert> : <div className="grid gap-5"><TextField fullWidth select label="Equipo" value={teamId} onChange={(event) => setTeamId(event.target.value)}>{teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</TextField><TextField fullWidth select label="Usuario" value={userId} onChange={(event) => setUserId(event.target.value)}>{users.map((user) => <MenuItem key={user.id} value={user.id}>{user.name} {user.lastname} · {user.email}</MenuItem>)}</TextField><div className="grid gap-4 sm:grid-cols-2"><TextField label="Rol CRM" placeholder="Ej. Ejecutivo de cuenta" value={role} onChange={(event) => setRole(event.target.value)} /><TextField select label="Alcance" value={scope} onChange={(event) => setScope(event.target.value)}><MenuItem value="OWN">Propios</MenuItem><MenuItem value="TEAM">Equipo</MenuItem><MenuItem value="ORGANIZATION">Organización</MenuItem><MenuItem value="GLOBAL">Global</MenuItem></TextField></div><Button fullWidth variant="contained" disabled={!teamId || !userId || !role.trim() || memberState.loading} onClick={() => void saveMember()}>Agregar miembro</Button></div>}
      </SectionCard>
    </div>
    {teamsQuery.error ? <Alert severity="error">{getApolloErrorMessage(teamsQuery.error)}</Alert> : null}
    {organizationId ? <SectionCard title="Equipos de la organización" badge={teams.length} description="Estructura disponible para asignar recursos y permisos contextuales." icon={<GroupsRounded />}><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{teams.length ? teams.map((team) => <button type="button" onClick={() => setTeamId(team.id)} key={team.id} className={`group rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${teamId === team.id ? 'border-accent bg-accent-soft/70 ring-2 ring-accent/20' : 'border-border/70 bg-surface-card-hover hover:border-accent/30'}`}><div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent"><PeopleAltRounded fontSize="small" /></span><Chip size="small" label={teamId === team.id ? 'Seleccionado' : 'Equipo'} color={teamId === team.id ? 'primary' : 'default'} /></div><p className="mt-4 font-semibold text-text">{team.name}</p><p className="mt-1 line-clamp-2 text-sm leading-5 text-text-secondary">{team.description || 'Sin descripción definida.'}</p><span className="mt-4 block text-xs font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">Usar este equipo →</span></button>) : <p className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">Aún no hay equipos. Crea el primero arriba.</p>}</div></SectionCard> : null}
  </div>;
};

export default CRMAdministrationPage;
