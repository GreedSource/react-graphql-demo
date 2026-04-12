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
    const networkError = apolloError.networkError as any;
    const statusCode = networkError?.statusCode || networkError?.status;

    // Handle HTTP status codes with user-friendly messages
    if (statusCode === 403) {
      return 'No tienes permisos para realizar esta acción. Contacta a un administrador.';
    }
    if (statusCode === 401) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    if (statusCode === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }
    if (statusCode === 500) {
      return 'Error del servidor. Por favor, intenta más tarde.';
    }
    if (statusCode) {
      return `Error de conexión (código ${statusCode}). Por favor, verifica tu conexión e intenta de nuevo.`;
    }

    return (
      apolloError.networkError.message || 'Error de conexión con el servidor.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrio un error inesperado.';
}

export function formatRolePermissionLabel(type: string, action: string) {
  return `${type}:${action}`;
}
