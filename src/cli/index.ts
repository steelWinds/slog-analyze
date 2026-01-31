import { analyze, analyzeConfig } from '@/cli/commands/analyze/index.ts';
import { extname, join } from 'node:path';
import { Command } from '@commander-js/extra-typings';
import { Logger } from '@/utils/logger/index.ts';
import { SUPPORTED_LOG_EXTNAMES } from '@/cli/constants.ts';
import { lstat } from 'node:fs/promises';
import yoctoSpinner from 'yocto-spinner';

export const run = () => {
	const program = new Command();

	program
		.name(import.meta.env.TSDOWN_APP_NAME)
		.description(import.meta.env.TSDOWN_APP_DESCRIPTION)
		.version(import.meta.env.TSDOWN_APP_VERSION);

	program
		.command(analyzeConfig.name)
		.description(analyzeConfig.description)
		.arguments(analyzeConfig.arguments)
		.action(async (from, to) => {
			const spinner = yoctoSpinner({ text: 'Start analyze...' });

			try {
				const fromIsDirectory = (await lstat(from)).isFile();
				const fromIsLogFile = SUPPORTED_LOG_EXTNAMES.includes(extname(from));
				const toIsDirectory = (await lstat(to)).isDirectory();

				if (!fromIsDirectory) {
					throw new Error('Failed: from path is not a file');
				} else if (!fromIsLogFile) {
					throw new Error('Failed: from path is not a log file');
				} else if (!toIsDirectory) {
					throw new Error('Failed: to path is not a directory');
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
