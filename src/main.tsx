import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { HelmetProvider } from 'react-helmet-async';
import { apolloClient } from './apollo/client';
import { initializeStores } from './stores/init';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

async function bootstrap() {
  try {
    await initializeStores();
  } catch (error) {
    console.error('Critical error during store initialization:', error);
  }

  const container = document.getElementById('root');
  if (!container) {
    throw new Error("Root container '#root' was not found in the DOM.");
  }

  createRoot(container).render(
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

bootstrap().catch((error) => {
  console.error('Fatal application bootstrap failure:', error);
});
