import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
  Observable,
  split,
  type FetchResult,
  type Operation,
  type NextLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { useUserStore } from '@/stores/user.store';
import { REFRESH_TOKEN } from '@/graphql/auth/mutations';
import { toast } from 'react-toastify';

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
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: getGraphQlWsEndpoint(import.meta.env.VITE_GRAPHQL_ENDPOINT),
    connectionParams: async () => {
      const { accessToken } = useUserStore.getState();

      return {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      };
    },
    lazy: true,
    retryAttempts: 3,
  }),
);

const authLink = new ApolloLink((operation, forward) => {
  const { accessToken } = useUserStore.getState();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  }));

  return forward(operation);
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    const { refreshToken, setAccessToken, logout } = useUserStore.getState();
    if (graphQLErrors && graphQLErrors.length > 0) {
      graphQLErrors.forEach(({ message, extensions }) => {
        const code = extensions?.code || 'UNKNOWN_ERROR';
        if (code !== 'UNAUTHORIZED') {
          toast.error(`${code}: ${message}`);
        }
      });
    }
    if (
      networkError &&
      'statusCode' in networkError &&
      networkError.statusCode === 401
    ) {
      if (!refreshToken) {
        logout();
        return;
      }

      return refreshTokenFlow(
        operation,
        forward,
        refreshToken,
        setAccessToken,
        logout,
      );
    }
  },
);

function refreshTokenFlow(
  operation: Operation,
  forward: NextLink,
  refreshToken: string,
  setAccessToken: (token: string) => void,
  logout: () => void,
): Observable<FetchResult> {
  const refreshClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  return new Observable<FetchResult>((observer) => {
    refreshClient
      .mutate({
        mutation: REFRESH_TOKEN,
        variables: { refreshToken },
      })
      .then(({ data }) => {
        const newToken = data?.refreshToken.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            },
          }));
          forward(operation).subscribe(observer);
        } else {
          logout();
          observer.error(new Error('No se pudo refrescar el token'));
        }
      })
      .catch((err) => {
        logout();
        observer.error(err);
      });
  });
}

const httpTransportLink = from([errorLink, authLink, httpLink]);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpTransportLink,
);

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});
