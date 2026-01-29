import { defineConfig } from 'tsdown';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	alias: {
		'@': fileURLToPath(new URL('./src', import.meta.url)),
	},
	entry: 'bin/slog-analyze.ts',
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
		'yocto-spinner',
		'consola',
	],
	ignoreWatch: ['node_modules', 'build', '__tests__'],
	outDir: './build',
	platform: 'node',
});
