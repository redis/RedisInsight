import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { fileURLToPath, URL } from 'url'
import path from 'path'
import { defaultConfig } from 'uiSrc/config/default'

const base = '/'

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  base,
  plugins: [
    react(),
    svgr({ include: ['../**/*.svg?react'] }),
    reactClickToComponent(),
    ViteEjsPlugin(),
    // Inject app info to window global object via custom plugin
    {
      name: 'app-info',
      transformIndexHtml(html) {
        const script = `<script>window.appInfo = ${JSON.stringify({
          version: defaultConfig.app.version,
          sha: defaultConfig.app.sha,
        })};</script>`

        return html.replace(/<head>/, `<head>\n  ${script}`)
      },
    },
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      '@elastic/eui$': '@elastic/eui/optimize/lib',
      '@redislabsdev/redis-ui-components': '@redis-ui/components',
      '@redislabsdev/redis-ui-styles': '@redis-ui/styles',
      '@redislabsdev/redis-ui-icons': '@redis-ui/icons',
      '@redislabsdev/redis-ui-table': '@redis-ui/table',
      uiSrc: fileURLToPath(new URL('../garnetinsight/ui/src', import.meta.url)),
      apiSrc: fileURLToPath(
        new URL('../garnetinsight/api/src', import.meta.url),
      ),
    },
  },
  server: {
    fs: {
      allow: ['..', '../node_modules/monaco-editor', 'static', 'defaults'],
    },
  },
  envPrefix: 'RI_',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()
          }

          if (id.includes('ui/src/assets')) {
            return 'assets'
          }
          return 'index'
        },
      },
    },
    commonjsOptions: {
      exclude: ['./packages'],
    },
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['monaco-editor', 'monaco-yaml/yaml.worker'],
    exclude: [
      'react-json-tree',
      'garnetinsight-plugin-sdk',
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
  css: {
    preprocessorOptions: {
      scss: {
        // add @layer app for css ordering. Styles without layer have the highest priority
        // https://github.com/vitejs/vite/issues/3924
        additionalData: (source: string, filename: string) => {
          if (path.extname(filename) === '.scss') {
            const skipFiles = ['/main.scss', '/App.scss']
            if (skipFiles.every((file) => !filename.endsWith(file))) {
              return `
                @use "uiSrc/styles/mixins/_eui.scss";
                @use "uiSrc/styles/mixins/_global.scss";
                @layer app { ${source} }
              `
            }
          }
          return source
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
      return { relative: true }
    },
  },
})
