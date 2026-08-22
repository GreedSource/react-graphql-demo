import { gql } from '@apollo/client';

export const CRM_LIST_QUERIES = {
  companies: gql`query Companies($organizationId: ID!) { companies(organizationId: $organizationId) { status message data { id organizationId teamId ownerId name industry website phone email address status archivedAt createdAt updatedAt } } }`,
  contacts: gql`query Contacts($organizationId: ID!) { contacts(organizationId: $organizationId) { status message data { id organizationId teamId ownerId companyId name lastname email phone position status createdAt updatedAt } } }`,
  leads: gql`query Leads($organizationId: ID!) { leads(organizationId: $organizationId) { status message data { id organizationId teamId ownerId companyId contactId name source status score archivedAt convertedAt createdAt updatedAt } } }`,
  opportunities: gql`query Opportunities($organizationId: ID!) { opportunities(organizationId: $organizationId) { status message data { id organizationId teamId ownerId companyId contactId leadId name value probability stage expectedCloseDate closedAt createdAt updatedAt } } }`,
  activities: gql`query Activities($organizationId: ID!) { activities(organizationId: $organizationId) { status message data { id organizationId teamId ownerId companyId contactId leadId opportunityId activityType subject description status scheduledAt completedAt createdAt updatedAt } } }`,
};

export const CRM_DASHBOARD = gql`
  query CRMDashboard($organizationId: ID!) {
    crmDashboard(organizationId: $organizationId) {
      status message
      data { companies contacts leads opportunities activities pipelineValue }
    }
  }
`;

export const CRM_ORGANIZATIONS = gql`
  query CRMOrganizations {
    crmOrganizations { status message data { id name slug } }
  }
`;

export const CRM_TEAMS = gql`
  query CRMTeams($organizationId: ID!) {
    crmTeams(organizationId: $organizationId) {
      status message data { id organizationId name description }
    }
  }
`;
