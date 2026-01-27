import {
	FIELDS,
	FORMATS,
	START_WITHOUT_INSTANCE_STRING,
} from '@/utils/parseCLFLine/constants.ts';
import type { FormatCLF, ParsedCLF } from '@/utils/parseCLFLine/types.ts';

export const parseCLFLine = (line: string): ParsedCLF | null => {
	let matchesExec: RegExpExecArray | null = null;
	let formatName: FormatCLF | null = null;

	for (const [key, regexp] of Object.entries(FORMATS) as [
		FormatCLF,
		RegExp,
	][]) {
		matchesExec = regexp.exec(line);

		if (matchesExec) {
			formatName = key;

			break;
		}
	}

	if (!matchesExec || !formatName) {
		return null;
	}

	const formatted = Object.fromEntries(
		matchesExec
			.slice(START_WITHOUT_INSTANCE_STRING)
			.map((value, idx) => [FIELDS[formatName][idx], value]),
	) as unknown as ParsedCLF;

	return formatted;
};
