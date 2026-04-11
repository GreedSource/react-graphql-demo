import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  from,
  split,
  type FetchResult,
  type NextLink,
  type Operation,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { toast } from 'react-toastify';
import { REFRESH_TOKEN } from '@/graphql/auth/mutations';
import { useUserStore } from '@/stores/user.store';

function getGraphQlWsEndpoint(httpEndpoint: string) {
  try {
    const url = new URL(httpEndpoint, window.location.origin);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  } catch {
    return httpEndpoint.replace(/^http/i, 'ws');
  }
}

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql',
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: getGraphQlWsEndpoint(import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql'),
    lazy: true,
    retryAttempts: 3,
    connectionParams: async () => {
      const { accessToken } = useUserStore.getState();

      return {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      };
    },
  }),
);

const authLink = new ApolloLink((operation, forward) => {
  const { accessToken } = useUserStore.getState();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    fetchOptions: {
      credentials: 'include',
    },
  }));

  return forward(operation);
});

function refreshTokenFlow(
  operation: Operation,
  forward: NextLink,
  refreshToken: string,
) {
  return new Observable<FetchResult>((observer) => {
    apolloClient
      .mutate({
        mutation: REFRESH_TOKEN,
        variables: { refreshToken },
        context: {
          skipAuthRefresh: true,
          fetchOptions: { credentials: 'include' },
        },
      })
      .then(({ data }) => {
        const payload = data?.refreshToken?.data;

        if (!payload?.accessToken) {
          throw new Error(data?.refreshToken?.message || 'Sesion expirada.');
        }

        useUserStore.getState().setSession({
          user: payload.user ?? useUserStore.getState().user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken ?? refreshToken,
        });

        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            Authorization: `Bearer ${payload.accessToken}`,
          },
          fetchOptions: {
            credentials: 'include',
          },
        }));

        forward(operation).subscribe(observer);
      })
      .catch((error) => {
        useUserStore.getState().logout();
        observer.error(error);
      });
  });
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors?.length) {
    graphQLErrors.forEach(({ message, extensions }) => {
      if (extensions?.code !== 'UNAUTHORIZED') {
        toast.error(message);
      }
    });
  }

  const context = operation.getContext();

  if (context?.skipAuthRefresh) {
    return;
  }

  const statusCode =
    networkError && 'statusCode' in networkError
      ? networkError.statusCode
      : undefined;

  if (statusCode !== 401) {
    return;
  }

  const { refreshToken } = useUserStore.getState();

  if (!refreshToken) {
    useUserStore.getState().logout();
    return;
  }

  return refreshTokenFlow(operation, forward, refreshToken);
});

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query);

      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    from([errorLink, authLink, httpLink]),
  ),
});
