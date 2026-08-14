import { useQuery } from '@apollo/client';
import { AUDIT_LOGS } from '@/graphql/audit/queries';
import type { ApiResponse } from '@/types/admin';
import type { AuditLogEntity } from '@/types/project-platform';
interface AuditLogsResult { auditLogs: ApiResponse<AuditLogEntity[]>; }
export function useAuditLogs(limit = 100) { return useQuery<AuditLogsResult>(AUDIT_LOGS, { variables: { limit }, fetchPolicy: 'cache-and-network' }); }
