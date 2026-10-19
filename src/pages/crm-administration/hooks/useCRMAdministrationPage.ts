import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCrmAdministration,
  useCrmOrganization,
  useCrmTeams,
} from '@/hooks/crm.hook';
import { useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const useCRMAdministrationPage = () => {
  const { organizationId, setOrganizationId } = useCrmOrganization();
  const teamsQuery = useCrmTeams(organizationId);
  const usersQuery = useUsers();
  const {
    createOrganization,
    createTeam,
    addMember,
    organizationState,
    teamState,
    memberState,
  } = useCrmAdministration();
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [scope, setScope] = useState('TEAM');
  const [memberAdded, setMemberAdded] = useState(false);
  const teams = teamsQuery.data?.crmTeams.data ?? [];
  const users = usersQuery.data?.users.data ?? [];

  const handleOrganizationNameChange = (name: string) => {
    setOrganizationName(name);
    setOrganizationSlug(slugify(name));
  };

  const handleOrganizationChange = (id: string) => {
    setOrganizationId(id);
    setTeamId('');
    setMemberAdded(false);
  };

  const saveOrganization = async () => {
    try {
      const response = await createOrganization(
        organizationName.trim(),
        organizationSlug.trim(),
      );
      setOrganizationId(response.data.id);
      setOrganizationName('');
      setOrganizationSlug('');
      toast.success(response.message || 'Organización creada.');
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const saveTeam = async () => {
    try {
      const response = await createTeam(
        organizationId,
        teamName.trim(),
        teamDescription.trim() || undefined,
      );
      setTeamId(response.data.id);
      setTeamName('');
      setTeamDescription('');
      toast.success(response.message || 'Equipo creado.');
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const saveMember = async () => {
    try {
      const response = await addMember(teamId, userId, role.trim(), scope);
      setUserId('');
      setMemberAdded(true);
      toast.success(response.message || 'Miembro agregado.');
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const setupSteps = [
    Boolean(organizationId),
    Boolean(organizationId && teams.length),
    memberAdded,
  ];
  const queryError = teamsQuery.error || usersQuery.error;

  return {
    organizationId,
    handleOrganizationChange,
    organizationName,
    organizationSlug,
    handleOrganizationNameChange,
    setOrganizationSlug,
    teamName,
    setTeamName,
    teamDescription,
    setTeamDescription,
    teamId,
    setTeamId,
    userId,
    setUserId,
    role,
    setRole,
    scope,
    setScope,
    teams,
    users,
    setupSteps,
    queryError,
    organizationState,
    teamState,
    memberState,
    saveOrganization,
    saveTeam,
    saveMember,
  };
};
