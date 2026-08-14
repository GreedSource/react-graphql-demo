import { gql } from '@apollo/client';
export const AUDIT_LOGS = gql`query AuditLogs($limit: Int) { auditLogs(limit: $limit) { status message data { id userId module action resourceType resourceId status metadata createdAt } } }`;
