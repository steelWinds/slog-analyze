import { defineConfig } from 'tsdown'
import { fileURLToPath } from 'node:url';

export default defineConfig({
  entry: 'bin/slog-analyze.ts',
  platform: 'node',
  outDir: './build',
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
  ignoreWatch: ['node_modules', 'build', '__tests__'],
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
  ]
})
