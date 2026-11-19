import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cesium from 'vite-plugin-cesium';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [cesium()],
  base: '/universe-explorer/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        deepZoomPilot: resolve(projectRoot, 'deep-zoom-pilot.html'),
      },
    },
  },
});
