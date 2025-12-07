import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    emptyOutDir: false,
    outDir: 'dist/renderer',
    rollupOptions: {
      input: {
        index: path.join(__dirname, './src/index.html'),
      },
      output: {
        format: 'es',
        chunkFileNames: '[name].[hash].js',
        entryFileNames: '[name].[hash].js',
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      uiSrc: path.resolve(__dirname, '../ui/src'),
      apiSrc: path.resolve(__dirname, '../api/src'),
    },
  },
  optimizeDeps: {
    include: ['electron'],
  },
})
