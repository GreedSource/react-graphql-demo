import { useSubscription } from '@apollo/client';
import { HELLO_STREAM_SUBSCRIPTION } from '@/graphql/hello/subscriptions';

interface HelloStreamSubscriptionData {
  helloStream: string;
}

export const HomePage = () => {
  const { data, loading, error } =
    useSubscription<HelloStreamSubscriptionData>(HELLO_STREAM_SUBSCRIPTION);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Home</h1>
        <p className="text-sm text-gray-600">
          La subscription `helloStream` queda conectada por WebSocket usando
          `graphql-transport-ws`.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Estado del stream</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {loading ? 'Conectando...' : data?.helloStream ?? 'Sin eventos aun'}
        </p>
        {error ? (
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
        ) : null}
      </div>
    </section>
  );
};

export default HomePage;
