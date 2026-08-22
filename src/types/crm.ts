export interface CRMResource {
  id: string;
  organizationId: string;
  teamId?: string | null;
  ownerId?: string | null;
  companyId?: string | null;
  contactId?: string | null;
  leadId?: string | null;
  opportunityId?: string | null;
  name?: string | null;
  lastname?: string | null;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  position?: string | null;
  source?: string | null;
  status?: string | null;
  score?: number | null;
  value?: string | null;
  probability?: number | null;
  stage?: string | null;
  activityType?: string | null;
  subject?: string | null;
  description?: string | null;
  scheduledAt?: string | null;
  expectedCloseDate?: string | null;
  archivedAt?: string | null;
  convertedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CRMModule = 'companies' | 'contacts' | 'leads' | 'opportunities' | 'activities';

export interface CRMDashboardSummary {
  companies: number;
  contacts: number;
  leads: number;
  opportunities: number;
  activities: number;
  pipelineValue: string;
}

export interface CRMResourceInput {
  organizationId: string;
  teamId?: string;
  ownerId?: string;
  companyId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  name?: string;
  lastname?: string;
  industry?: string;
  website?: string;
  address?: string;
  email?: string;
  phone?: string;
  position?: string;
  source?: string;
  status?: string;
  score?: number;
  value?: string;
  probability?: number;
  stage?: string;
  activityType?: string;
  subject?: string;
  description?: string;
  scheduledAt?: string;
  expectedCloseDate?: string;
}

export interface CRMOrganization { id: string; name: string; slug: string; }
export interface CRMTeam { id: string; organizationId: string; name: string; description?: string | null; }
export interface CRMTeamMember { id: string; teamId: string; userId: string; role: string; scope: string; }
