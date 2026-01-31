import { analyze, analyzeConfig } from 'src/cli/commands/analyze/index.ts';
import { extname, join } from 'node:path';
import { lstat, mkdir } from 'node:fs/promises';
import { Command } from '@commander-js/extra-typings';
import { Logger } from 'src/utils/logger/index.ts';
import { SUPPORTED_LOG_EXTNAMES } from 'src/cli/constants.ts';
import { version } from 'lib/version.js';
import yoctoSpinner from 'yocto-spinner';

export const run = () => {
	const program = new Command();

	program
		.name(import.meta.env.TSDOWN_APP_NAME)
		.description(import.meta.env.TSDOWN_APP_DESCRIPTION)
		.version(version);

	program
		.command(analyzeConfig.name)
		.description(analyzeConfig.description)
		.arguments(analyzeConfig.arguments)
		.action(async (from, to) => {
			const spinner = yoctoSpinner({ text: 'Start analyze...' });

			try {
				const fromIsDirectory = (await lstat(from)).isFile();
				const fromIsLogFile = SUPPORTED_LOG_EXTNAMES.includes(extname(from));

				await mkdir(to, { recursive: true });

				if (!fromIsDirectory) {
					throw new Error('Failed: from path is not a file');
				} else if (!fromIsLogFile) {
					throw new Error('Failed: from path is not a log file');
				}

				await analyze(from, join(to, 'result.json'));

				setTimeout(() =>
					Logger.success(
						`Logs have been analyzed, results written by path: ${to}`,
					),
				);
			} catch (err: any) {
				setTimeout(() => Logger.error(err.message));
			} finally {
				spinner.stop();
			}
		});

	program.parse();
};
