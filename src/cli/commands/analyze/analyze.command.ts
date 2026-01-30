import { FileStreamService } from '@/services/fs/index.ts';
import { LogAnalyzer } from '@/core/logAnalyzer/index.ts';
import { parseCLFLine } from '@/utils/parseCLFLine/index.ts';

export const analyze = async (from: string, to: string) => {
	const fs = new FileStreamService();
	const logAnalyzer = new LogAnalyzer();

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
};
