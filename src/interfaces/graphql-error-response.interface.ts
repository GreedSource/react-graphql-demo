export interface GraphQLErrorResponse {
  message: string;
  extensions?: {
    code?: string;
    details?: Record<string, unknown>;
  };
}
