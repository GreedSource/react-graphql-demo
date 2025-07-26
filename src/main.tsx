import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo/client';
import { initializeStores } from './stores/init'; // 👈 asegúrate de exportar bien
import './index.css';

async function bootstrap() {
  await initializeStores(); // 👈 Espera a cargar el store desde IndexedDB

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </StrictMode>
  );
}

bootstrap();
