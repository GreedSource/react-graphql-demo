import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

interface PackageMetadata {
  version?: string;
}

const packageMetadata = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as PackageMetadata;

const packageVersion = packageMetadata.version ?? '0.0.0';
const buildVersion = packageVersion.replace(/[^a-zA-Z0-9.-]/g, '-');
const buildId = `${buildVersion}-${Date.now().toString(36)}`;
const versionFile = JSON.stringify(
  {
    version: packageVersion,
    buildId,
    builtAt: new Date().toISOString(),
  },
  null,
  2,
);

const buildVersionPlugin = (): Plugin => ({
  name: 'build-version',
  configureServer(server) {
    server.middlewares.use('/version.json', (request, response, next) => {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        next();
        return;
      }

      response.statusCode = 200;
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Content-Type', 'application/json');
      response.end(versionFile);
    });
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: versionFile,
    });
  },
});

const manualChunks = (id: string): string | undefined => {
  if (!id.includes('/node_modules/')) return undefined;

  if (
    id.includes('/node_modules/react/') ||
    id.includes('/node_modules/react-dom/') ||
    id.includes('/node_modules/react-router-dom/') ||
    id.includes('/node_modules/@remix-run/')
  ) {
    return 'react-vendor';
  }

  if (
    id.includes('/node_modules/@mui/') ||
    id.includes('/node_modules/@emotion/')
  ) {
    return 'mui-vendor';
  }

  if (
    id.includes('/node_modules/@apollo/') ||
    id.includes('/node_modules/graphql/') ||
    id.includes('/node_modules/graphql-ws/')
  ) {
    return 'graphql-vendor';
  }

  if (
    id.includes('/node_modules/crypto-js/') ||
    id.includes('/node_modules/idb/') ||
    id.includes('/node_modules/zustand/')
  ) {
    return 'state-vendor';
  }

  if (
    id.includes('/node_modules/react-toastify/') ||
    id.includes('/node_modules/react-helmet-async/')
  ) {
    return 'ui-vendor';
  }

  return undefined;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [buildVersionPlugin(), react(), tailwindcss(), tsconfigPaths()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  server: {
    open: true,
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v${buildVersion}-[hash].js`,
        chunkFileNames: `assets/[name]-v${buildVersion}-[hash].js`,
        assetFileNames: `assets/[name]-v${buildVersion}-[hash][extname]`,
        manualChunks,
      },
    },
  },
});
