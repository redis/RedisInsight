import 'dotenv/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import fixReactVirtualized from 'esbuild-plugin-react-virtualized';
import { reactClickToComponent } from 'vite-plugin-react-click-to-component';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import istanbul from 'vite-plugin-istanbul';
import { sentryVitePlugin } from '@sentry/vite-plugin';
// import { compression } from 'vite-plugin-compression2'
import { fileURLToPath, URL } from 'url';
import path from 'path';
import { defaultConfig } from './src/config/default';

const isElectron = defaultConfig.app.type === 'ELECTRON';
// set path to index.tsx in the index.html
process.env.RI_INDEX_NAME = isElectron ? 'indexElectron.tsx' : 'index.tsx';

// Only generate + upload source maps when Sentry is enabled AND we have an
// auth token. This keeps disabled builds from generating maps that would
// otherwise ship (the upload plugin is what deletes them afterwards).
const shouldUploadSourceMaps =
  !!process.env.RI_SENTRY_AUTH_TOKEN &&
  process.env.RI_SENTRY_ENABLED === 'true';
const outDir = isElectron ? '../dist/renderer' : './dist';

let base;
if (defaultConfig.api.hostedBase) {
  base = defaultConfig.api.hostedBase;
} else {
  base =
    defaultConfig.app.env === 'development'
      ? '/'
      : isElectron
        ? ''
        : '/__RIPROXYPATH__';
}

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  base,
  plugins: [
    react(),
    svgr({ include: ['**/*.svg?react'] }),
    reactClickToComponent(),
    ViteEjsPlugin(),
    // Inject app info to window global object via custom plugin
    {
      name: 'app-info',
      transformIndexHtml(html) {
        const script = `<script>window.appInfo = ${JSON.stringify({
          version: defaultConfig.app.version,
          sha: defaultConfig.app.sha,
        })};</script>`;

        return html.replace(/<head>/, `<head>\n  ${script}`);
      },
    },
    // Add istanbul plugin for coverage collection when COLLECT_COVERAGE is true
    ...(process.env.COLLECT_COVERAGE === 'true'
      ? [
          istanbul({
            include: 'src/**/*',
            exclude: [
              'node_modules',
              'test/',
              '**/*.spec.ts',
              '**/*.spec.tsx',
              '**/*.test.ts',
              '**/*.test.tsx',
            ],
            extension: ['.js', '.ts', '.tsx'],
            requireEnv: false,
          }),
        ]
      : []),
    // !isElectron && compression({
    //   include: [/\.(js)$/, /\.(css)$/],
    //   deleteOriginalAssets: true
    // }),
    // Upload renderer source maps to Sentry (debug IDs match bundle↔map), then
    // delete them so they never ship inside the app. Gated on
    // shouldUploadSourceMaps (Sentry enabled + auth token). Must stay last.
    ...(shouldUploadSourceMaps
      ? [
          sentryVitePlugin({
            org: process.env.RI_SENTRY_ORG,
            project: process.env.RI_SENTRY_PROJECT,
            authToken: process.env.RI_SENTRY_AUTH_TOKEN,
            release: { name: defaultConfig.app.version },
            sourcemaps: {
              filesToDeleteAfterUpload: ['../dist/renderer/**/*.js.map'],
            },
            telemetry: false,
            // A failed source-map upload must not fail the build.
            errorHandler: (err) => {
              // eslint-disable-next-line no-console
              console.warn(
                '[Sentry] renderer source-map upload failed (continuing):',
                err.message,
              );
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      '@elastic/eui$': '@elastic/eui/optimize/lib',
      '@redislabsdev/redis-ui-components': '@redis-ui/components',
      '@redislabsdev/redis-ui-styles': '@redis-ui/styles',
      '@redislabsdev/redis-ui-icons': '@redis-ui/icons',
      '@redislabsdev/redis-ui-table': '@redis-ui/table',
      uiSrc: fileURLToPath(new URL('./src', import.meta.url)),
      apiClient: fileURLToPath(new URL('../api-client', import.meta.url)),
    },
  },
  server: {
    port: 8080,
    fs: {
      allow: ['..', '../../node_modules/monaco-editor', 'static', 'defaults'],
    },
  },
  envPrefix: 'RI_',
  optimizeDeps: {
    // Pin the entry scan to the main UI's index.html. Without this, Vite's
    // default ('**/*.html' under the project root, which is the workspace
    // root when invoked from the root postinstall) also crawls each plugin
    // sub-package's index.html in src/packages/*, whose deps live only in
    // the sub-package's own node_modules and fail to resolve at root install.
    entries: fileURLToPath(new URL('./index.html', import.meta.url)),
    include: ['monaco-editor', 'monaco-yaml/yaml.worker'],
    exclude: [
      'react-json-tree',
      'redisinsight-plugin-sdk',
      'plotly.js-dist-min',
      '@antv/x6',
      '@antv/x6-react-shape',
      '@antv/hierarchy',
      'class-transformer',
      'keytar',
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/event-emitter',
      '@nestjs/platform-express',
      '@nestjs/platform-socket.io',
      '@nestjs/serve-static',
      '@nestjs/swagger',
      '@nestjs/typeorm',
      '@nestjs/websockets',
      'nestjs-form-data',
    ],
    esbuildOptions: {
      // fix for https://github.com/bvaughn/react-virtualized/issues/1722
      plugins: [fixReactVirtualized],
    },
  },
  build: {
    commonjsOptions: {
      exclude: ['./packages'],
    },
    outDir,
    target: 'es2020',
    minify: 'esbuild',
    // Emit hidden source maps only when uploading to Sentry (the plugin above
    // deletes them after upload, so they never ship). Off otherwise.
    sourcemap: shouldUploadSourceMaps ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep all Sentry packages in one chunk to preserve initialization order
            if (id.includes('@sentry')) {
              return 'sentry';
            }
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }

          if (id.includes('ui/src/assets')) {
            return 'assets';
          }
          return 'index';
        },
      },
    },
    define: {
      this: 'window',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Pin the Sass API to the legacy compiler. Vite 6 silently switched the
        // default to 'modern-compiler' when sass-embedded is installed, which
        // changes how @import and additionalData are resolved and breaks the
        // existing stylesheets that still rely on @import.
        api: 'legacy',
        // add @layer app for css ordering. Styles without layer have the highest priority
        // https://github.com/vitejs/vite/issues/3924
        additionalData: (source, filename) => {
          if (path.extname(filename) === '.scss') {
            const skipFiles = ['/main.scss', '/App.scss'];
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
    riConfig: defaultConfig,
  },
  // hack: apply proxy path to monaco webworker
  experimental: {
    renderBuiltUrl() {
      return { relative: true };
    },
  },
});
