import { defineConfig } from 'vite';
import { transform } from 'esbuild';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defaultConfig } from '../config/default';

const riPlugins = [
  { name: 'redisearch', entry: 'src/main.tsx' },
  { name: 'clients-list', entry: 'src/main.tsx' },
  { name: 'redisgraph', entry: 'src/main.tsx' },
  { name: 'redistimeseries-app', entry: 'src/main.tsx' },
  { name: 'ri-explain', entry: 'src/main.tsx' },
];

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    react(),
    svgr({ include: ['**/*.svg?react'] }),
    ViteEjsPlugin(),
    minifyEs(),
    // Copy public static for all plugins
    viteStaticCopy({
      silent: true,
      targets: riPlugins.map(({ name: pluginDir }) => ({
        src: `./${pluginDir}/public/*`,
        dest: `./${pluginDir}/dist/`,
      })),
    }),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      '@elastic/eui$': '@elastic/eui/optimize/lib',
      '@redislabsdev/redis-ui-components': '@redis-ui/components',
      '@redislabsdev/redis-ui-styles': '@redis-ui/styles',
      '@redislabsdev/redis-ui-icons': '@redis-ui/icons',
      '@redislabsdev/redis-ui-table': '@redis-ui/table',
      uiSrc: fileURLToPath(new URL('../../src', import.meta.url)),
      apiSrc: fileURLToPath(new URL('../../../api/src', import.meta.url)),
    },
  },
  server: {
    port: 8081,
    fs: {
      allow: ['..'],
    },
  },
  envPrefix: 'RI_',
  build: {
    outDir: './',
    cssCodeSplit: true,
    lib: {
      // Multi entries
      entry: Object.fromEntries(
        riPlugins.map(({ name: pluginDir, entry }) => [
          pluginDir,
          resolve(__dirname, `./${pluginDir}/${entry}`),
        ]),
      ),
    },

    rollupOptions: {
      output: [
        {
          dir: './',
          format: 'esm',
          entryFileNames: '[name]/dist/index.js',
          assetFileNames: '[name]/dist/styles.css',
          chunkFileNames: 'common/index.js',
        },
      ],
    },
    target: 'es2022',
    minify: 'esbuild',

    define: {
      this: 'window',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // add @layer app for css ordering. Styles without layer have the highest priority
        // https://github.com/vitejs/vite/issues/3924
        additionalData: (source, filename) => {
          if (path.extname(filename) === '.scss') {
            const skipFiles = [
              '/main.scss',
              '/App.scss',
              '/packages/clients-list/src/styles/styles.scss',
              '/packages/redisearch/src/styles/styles.scss',
            ];
            if (skipFiles.every((file) => !filename.endsWith(file))) {
              return `
                @use "uiSrc/styles/mixins/_eui.scss";
                @use "uiSrc/styles/mixins/_global.scss";
                @layer app { ${source} }
              `;
            }
          }
          return source;
        },
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    // setup default riConfig since it might be used in constants
    riConfig: defaultConfig,
  },
});

function minifyEs() {
  return {
    name: 'minifyEs',
    renderChunk: {
      order: 'post',
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === 'es' && chunk.fileName.endsWith('.js')) {
          return transform(code, { minify: true });
        }
        return code;
      },
    },
  };
}
