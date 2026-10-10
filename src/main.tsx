import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { HelmetProvider } from 'react-helmet-async';
import { apolloClient } from './apollo/client';
import { initializeStores } from './stores/init'; // 👈 asegúrate de exportar bien
import { ensureCurrentBuild } from './lib/build-version';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

async function bootstrap() {
  if (!(await ensureCurrentBuild())) return;
  await initializeStores(); // 👈 Espera a cargar el store desde IndexedDB

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ApolloProvider client={apolloClient}>
        <HelmetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </ApolloProvider>
    </StrictMode>
  );
}

bootstrap();
