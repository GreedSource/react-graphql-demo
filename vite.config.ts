import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }

          if (id.includes('graphql-ws')) {
            return 'graphql-ws';
          }

          if (id.includes('/graphql/')) {
            return 'graphql-core';
          }

          if (id.includes('@apollo/client')) {
            if (id.includes('/react/')) {
              return 'apollo-react';
            }

            if (id.includes('/cache/') || id.includes('/core/')) {
              return 'apollo-core';
            }

            if (
              id.includes('/link/') ||
              id.includes('/utilities/')
            ) {
              return 'apollo-links';
            }

            return 'apollo';
          }

          if (id.includes('react-dom') || id.includes('react')) {
            return 'react-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
