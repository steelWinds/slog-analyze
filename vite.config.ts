/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'node18',
    outDir: 'dist',
    emptyOutDir: true,

    lib: {
      entry: fileURLToPath(new URL('bin/slog-analyze.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'slog-analyze.js',
    },

    rollupOptions: {
      external: [
        'fs',
        'fs/promises',
        'path',
        'url',
        'os',
        'process',
        'commander',
        '@commander-js/extra-typings',
        'chalk',
        'ora',
        'consola'
      ],
    },
  },
});
