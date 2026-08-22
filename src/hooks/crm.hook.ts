import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_CRM_TEAM_MEMBER, CLOSE_OPPORTUNITY, CONVERT_LEAD, CREATE_CRM_ORGANIZATION, CREATE_CRM_TEAM, CRM_CREATE_MUTATIONS, CRM_DELETE_MUTATIONS, CRM_UPDATE_MUTATIONS } from '@/graphql/crm/mutations';
import { CRM_DASHBOARD, CRM_LIST_QUERIES, CRM_ORGANIZATIONS, CRM_TEAMS } from '@/graphql/crm/queries';
import { ensureSuccess } from '@/lib/graphql';
import type { ApiResponse } from '@/types/admin';
import type { CRMDashboardSummary, CRMModule, CRMOrganization, CRMResource, CRMResourceInput, CRMTeam, CRMTeamMember } from '@/types/crm';

const ORGANIZATION_KEY = 'crm.organizationId';

const resourceNames: Record<CRMModule, string> = {
  companies: 'Company',
  contacts: 'Contact',
  leads: 'Lead',
  opportunities: 'Opportunity',
  activities: 'Activity',
};

export function useCrmOrganization() {
  const [organizationId, setOrganizationIdState] = React.useState(() => localStorage.getItem(ORGANIZATION_KEY) ?? '');
  const setOrganizationId = React.useCallback((value: string) => {
    const normalized = value.trim();
    setOrganizationIdState(normalized);
    if (normalized) localStorage.setItem(ORGANIZATION_KEY, normalized);
    else localStorage.removeItem(ORGANIZATION_KEY);
  }, []);
  return { organizationId, setOrganizationId };
}

interface CRMListResult {
  [key: string]: ApiResponse<CRMResource[]>;
}

interface CRMDashboardResult {
  crmDashboard: ApiResponse<CRMDashboardSummary>;
}

interface CRMOrganizationsResult { crmOrganizations: ApiResponse<CRMOrganization[]>; }
interface CRMTeamsResult { crmTeams: ApiResponse<CRMTeam[]>; }

export function useCrmDashboard(organizationId: string) {
  return useQuery<CRMDashboardResult>(CRM_DASHBOARD, {
    variables: { organizationId },
    skip: !organizationId,
    fetchPolicy: 'cache-and-network',
  });
}

export function useCrmOrganizations() {
  return useQuery<CRMOrganizationsResult>(CRM_ORGANIZATIONS, { fetchPolicy: 'cache-and-network' });
}

export function useCrmTeams(organizationId: string) {
  return useQuery<CRMTeamsResult>(CRM_TEAMS, {
    variables: { organizationId },
    skip: !organizationId,
    fetchPolicy: 'cache-and-network',
  });
}

export function useCrmResources(module: CRMModule, organizationId: string) {
  const query = CRM_LIST_QUERIES[module];
  const listState = useQuery<CRMListResult>(query, {
    variables: { organizationId },
    skip: !organizationId,
    fetchPolicy: 'cache-and-network',
  });
  const [createMutation, createState] = useMutation(CRM_CREATE_MUTATIONS[module]);
  const [deleteMutation, deleteState] = useMutation(CRM_DELETE_MUTATIONS[module]);
  const [updateMutation, updateState] = useMutation(CRM_UPDATE_MUTATIONS[module]);
  const [convertMutation, convertState] = useMutation(CONVERT_LEAD);
  const [closeMutation, closeState] = useMutation(CLOSE_OPPORTUNITY);

  const createResource = async (input: CRMResourceInput) => {
    const data = await createMutation({ variables: { input }, refetchQueries: [{ query, variables: { organizationId } }] });
    const response = data.data?.[`create${resourceNames[module]}`];
    return ensureSuccess(response, 'No se pudo crear el recurso CRM.');
  };

  const deleteResource = async (id: string) => {
    const data = await deleteMutation({ variables: { id }, refetchQueries: [{ query, variables: { organizationId } }] });
    const responseKey = `delete${resourceNames[module]}`;
    return ensureSuccess(data.data?.[responseKey], 'No se pudo eliminar el recurso CRM.');
  };

  const updateResource = async (input: { id: string } & Partial<Omit<CRMResourceInput, 'organizationId'>>) => {
    const data = await updateMutation({ variables: { input }, refetchQueries: [{ query, variables: { organizationId } }] });
    return ensureSuccess(data.data?.[`update${resourceNames[module]}`], 'No se pudo actualizar el recurso CRM.');
  };

  const convertLead = async (input: { id: string; opportunityName: string; value: string; probability: number }) => {
    const data = await convertMutation({ variables: { input }, refetchQueries: [{ query, variables: { organizationId } }] });
    return ensureSuccess(data.data?.convertLead, 'No se pudo convertir el lead.');
  };

  const closeOpportunity = async (input: { id: string; stage: string }) => {
    const data = await closeMutation({ variables: { input }, refetchQueries: [{ query, variables: { organizationId } }] });
    return ensureSuccess(data.data?.closeOpportunity, 'No se pudo cerrar la oportunidad.');
  };

  return { listState, createResource, updateResource, deleteResource, convertLead, closeOpportunity, createState, updateState, deleteState, convertState, closeState };
}

export function useCrmAdministration() {
  const [createOrganizationMutation, organizationState] = useMutation<{ createCRMOrganization: ApiResponse<CRMOrganization> }>(CREATE_CRM_ORGANIZATION);
  const [createTeamMutation, teamState] = useMutation<{ createCRMTeam: ApiResponse<CRMTeam> }>(CREATE_CRM_TEAM);
  const [addMemberMutation, memberState] = useMutation<{ addCRMTeamMember: ApiResponse<CRMTeamMember> }>(ADD_CRM_TEAM_MEMBER);

  const createOrganization = async (name: string, slug: string) => {
    const { data } = await createOrganizationMutation({ variables: { name, slug }, refetchQueries: [{ query: CRM_ORGANIZATIONS }], awaitRefetchQueries: true });
    return ensureSuccess(data?.createCRMOrganization, 'No se pudo crear la organización.');
  };
  const createTeam = async (organizationId: string, name: string, description?: string) => {
    const { data } = await createTeamMutation({ variables: { organizationId, name, description }, refetchQueries: [{ query: CRM_TEAMS, variables: { organizationId } }], awaitRefetchQueries: true });
    return ensureSuccess(data?.createCRMTeam, 'No se pudo crear el equipo.');
  };
  const addMember = async (teamId: string, userId: string, role: string, scope: string) => {
    const { data } = await addMemberMutation({ variables: { teamId, userId, role, scope } });
    return ensureSuccess(data?.addCRMTeamMember, 'No se pudo agregar el miembro.');
  };
  return { createOrganization, createTeam, addMember, organizationState, teamState, memberState };
}
