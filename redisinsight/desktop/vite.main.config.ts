import { defineConfig } from 'vite'
import { builtinModules } from 'module'
import path from 'path'

const apiDistPath = path.resolve(__dirname, '../api/dist/src')

// Modules/patterns kept out of the main bundle. Rollup's `external` array only
// accepts string | RegExp, so the predicate (api dist files) is folded into a
// single function form instead of being mixed into the array.
const externalModules = new Set<string>([
  'electron',
  'ts-node',
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
])
const externalPatterns = [/^@nestjs\/.*/, /^@sentry\/.*/, /^src\//]

const isExternal = (id: string): boolean =>
  externalModules.has(id) ||
  externalPatterns.some((pattern) => pattern.test(id)) ||
  id.startsWith(apiDistPath)

export default defineConfig({
  plugins: [
    {
      name: 'resolve-imports',
      enforce: 'pre',
      resolveId(source) {
        if (source.startsWith('desktopSrc/')) {
          const relativePath = source.replace('desktopSrc/', '')
          return path.join(__dirname, 'src', relativePath)
        }
        if (source.startsWith('apiSrc/') || source.includes('api/dist/src/')) {
          const modulePath = source.includes('apiSrc/')
            ? source.replace('apiSrc/', '')
            : source.split('api/dist/src/')[1]

          return {
            id: path.join(apiDistPath, modulePath),
            external: 'absolute',
          }
        }
        return null
      },
    },
  ],
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: isExternal,
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        interop: 'auto',
        preserveModules: true,
        preserveModulesRoot: path.resolve(__dirname),
      },
    },
  },
  resolve: {
    alias: {
      desktopSrc: path.resolve(__dirname, 'src'),
      uiSrc: path.resolve(__dirname, '../ui/src'),
    },
  },
})
