import { gql } from '@apollo/client';

export const CRM_CREATE_MUTATIONS = {
  companies: gql`mutation CreateCompany($input: CreateCompanyInput!) { createCompany(input: $input) { status message data { id organizationId teamId ownerId name industry website phone email address status archivedAt createdAt updatedAt } } }`,
  contacts: gql`mutation CreateContact($input: CreateContactInput!) { createContact(input: $input) { status message data { id organizationId teamId ownerId companyId name lastname email phone position status createdAt updatedAt } } }`,
  leads: gql`mutation CreateLead($input: CreateLeadInput!) { createLead(input: $input) { status message data { id organizationId teamId ownerId companyId contactId name source status score archivedAt convertedAt createdAt updatedAt } } }`,
  opportunities: gql`mutation CreateOpportunity($input: CreateOpportunityInput!) { createOpportunity(input: $input) { status message data { id organizationId teamId ownerId companyId contactId leadId name value probability stage expectedCloseDate closedAt createdAt updatedAt } } }`,
  activities: gql`mutation CreateActivity($input: CreateActivityInput!) { createActivity(input: $input) { status message data { id organizationId teamId ownerId companyId contactId leadId opportunityId activityType subject description status scheduledAt completedAt createdAt updatedAt } } }`,
};

export const CRM_UPDATE_MUTATIONS = {
  companies: gql`mutation UpdateCompany($input: UpdateCompanyInput!) { updateCompany(input: $input) { status message data { id name industry website phone email address status updatedAt } } }`,
  contacts: gql`mutation UpdateContact($input: UpdateContactInput!) { updateContact(input: $input) { status message data { id name lastname email phone position status updatedAt } } }`,
  leads: gql`mutation UpdateLead($input: UpdateLeadInput!) { updateLead(input: $input) { status message data { id name source status score updatedAt } } }`,
  opportunities: gql`mutation UpdateOpportunity($input: UpdateOpportunityInput!) { updateOpportunity(input: $input) { status message data { id name value probability stage expectedCloseDate updatedAt } } }`,
  activities: gql`mutation UpdateActivity($input: UpdateActivityInput!) { updateActivity(input: $input) { status message data { id activityType subject description status scheduledAt updatedAt } } }`,
};

export const CRM_DELETE_MUTATIONS = {
  companies: gql`mutation DeleteCompany($id: ID!) { deleteCompany(id: $id) { status message data } }`,
  contacts: gql`mutation DeleteContact($id: ID!) { deleteContact(id: $id) { status message data } }`,
  leads: gql`mutation DeleteLead($id: ID!) { deleteLead(id: $id) { status message data } }`,
  opportunities: gql`mutation DeleteOpportunity($id: ID!) { deleteOpportunity(id: $id) { status message data } }`,
  activities: gql`mutation DeleteActivity($id: ID!) { deleteActivity(id: $id) { status message data } }`,
};

export const CONVERT_LEAD = gql`mutation ConvertLead($input: ConvertLeadInput!) { convertLead(input: $input) { status message data { id name stage value } } }`;
export const CLOSE_OPPORTUNITY = gql`mutation CloseOpportunity($input: CloseOpportunityInput!) { closeOpportunity(input: $input) { status message data { id name stage value } } }`;

export const CREATE_CRM_ORGANIZATION = gql`mutation CreateCRMOrganization($name: String!, $slug: String!) { createCRMOrganization(name: $name, slug: $slug) { status message data { id name slug } } }`;
export const CREATE_CRM_TEAM = gql`mutation CreateCRMTeam($organizationId: ID!, $name: String!, $description: String) { createCRMTeam(organizationId: $organizationId, name: $name, description: $description) { status message data { id organizationId name description } } }`;
export const ADD_CRM_TEAM_MEMBER = gql`mutation AddCRMTeamMember($teamId: ID!, $userId: ID!, $role: String!, $scope: String!) { addCRMTeamMember(teamId: $teamId, userId: $userId, role: $role, scope: $scope) { status message data { id teamId userId role scope } } }`;
