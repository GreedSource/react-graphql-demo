import type { ApolloError } from '@apollo/client';
import type { ApiResponse } from '@/types/admin';

export function isSuccessStatus(status: number) {
  return status >= 200 && status < 300;
}

export function getResponseMessage<T>(
  response?: ApiResponse<T> | null,
  fallback = 'La operacion no pudo completarse.',
) {
  return response?.message || fallback;
}

export function ensureSuccess<T>(
  response: ApiResponse<T> | undefined | null,
  fallback = 'La operacion no pudo completarse.',
) {
  if (!response) {
    throw new Error(fallback);
  }

  if (!isSuccessStatus(response.status)) {
    throw new Error(getResponseMessage(response, fallback));
  }

  return response;
}

export function getApolloErrorMessage(error: unknown) {
  const apolloError = error as ApolloError | undefined;

  if (apolloError?.graphQLErrors?.length) {
    return apolloError.graphQLErrors.map((item) => item.message).join(', ');
  }

  if (apolloError?.networkError) {
    return apolloError.networkError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrio un error inesperado.';
}

export function formatRolePermissionLabel(type: string, action: string) {
  return `${type}:${action}`;
}
