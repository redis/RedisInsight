import { defineConfig } from 'vite'
import { builtinModules } from 'module'
import path from 'path'

const apiDistPath = path.resolve(__dirname, '../api/dist/src')

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
      external: [
        'electron',
        'ts-node',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        /^@nestjs\/.*/,
        /^src\//,
        (id) => id.startsWith(apiDistPath),
      ],
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
