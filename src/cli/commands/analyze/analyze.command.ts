import { FileStreamService } from '@/services/fs/index.ts';
import { LogAnalyzer } from '@/core/logAnalyzer/index.ts';
import { Logger } from '@/utils/logger/index.ts';
import { parseCLFLine } from '@/utils/parseCLFLine/index.ts';
import yoctoSpinner from 'yocto-spinner';

export const analyze = async (from: string, to: string) => {
	const fs = new FileStreamService();
	const logAnalyzer = new LogAnalyzer();

	const spinner = yoctoSpinner({ text: 'Analyzing logs...' }).start();

	try {
		await fs.readTextFile({
			from,
			transformOptions: {
				callback: async (chunk) => {
					const str = String(chunk);

					const parseChunk = parseCLFLine(str);

					if (!parseChunk) {
						throw new Error(`Failed parse chunk: ${chunk}`);
					}

					logAnalyzer.combine(parseChunk);
				},
				encoding: 'utf-8',
				readline: true,
			},
		});

		await fs.writeTextFile({
			source: JSON.stringify(logAnalyzer.getResult(), null, 1),
			to,
		});

		setTimeout(() => {
			Logger.success(`Logs have been analyzed, results written by path: ${to}`);
			Logger.log('Have a nice day! ;з');
		});
	} catch (err: any) {
		setTimeout(() => Logger.error(`Error while analyze: ${err.message}`));
	} finally {
		spinner.stop();
	}
};
