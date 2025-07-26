import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
  Observable,
  type FetchResult,
  type Operation,
  type NextLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { useUserStore } from '@/stores/user.store'; // o tu store de tokens
import { REFRESH_TOKEN } from '@/graphql/auth/mutations';
import { toast } from 'react-toastify';

// Http link para enviar las peticiones al servidor
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
});

// Link para agregar el token de acceso a cada request
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

// Link para manejar errores, detectar 401, refrescar token y reintentar la petición

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    const { refreshToken, setAccessToken, logout } = useUserStore.getState();
    if (graphQLErrors && graphQLErrors.length > 0) {
      graphQLErrors.forEach(({ message, extensions }) => {
        const code = extensions?.code || 'UNKNOWN_ERROR';
        toast.error(`${code}: ${message}`);
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
        logout
      );
    }
  }
);

function refreshTokenFlow(
  operation: Operation,
  forward: NextLink,
  refreshToken: string,
  setAccessToken: (token: string) => void,
  logout: () => void
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
        const newToken = data?.refreshToken?.accessToken;
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

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, authLink, httpLink]),
});
