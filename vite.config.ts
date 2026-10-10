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
      },
    },
  },
});
