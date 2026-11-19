import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cesium from 'vite-plugin-cesium';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    cesium(),
    {
      name: 'skip-eager-cesium-global',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html
            .replace(/<script\b[^>]*src="[^"]*\/Cesium\.js"[^>]*><\/script>\s*/g, '')
            .replace(/<link\b[^>]*href="[^"]*\/Widgets\/widgets\.css"[^>]*>\s*/g, '');
        },
      },
    },
  ],
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
