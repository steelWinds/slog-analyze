import {
	FIELDS,
	FORMATS,
	START_WITHOUT_INSTANCE_STRING,
} from '@/utils/parseCLFLine/constants.ts';
import type { FormatCLF, ParsedCLF } from '@/utils/parseCLFLine/types.ts';
import { DEFAULT_FORMATS } from '@/utils/parseCLFLine/config.ts';

export const parseCLFLine = (
	line: string,
	formats?: Partial<typeof DEFAULT_FORMATS>,
): ParsedCLF | null => {
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

	const _formats = {
		...DEFAULT_FORMATS,
		...(formats ?? {}),
	};

	const formatted = Object.fromEntries(
		matchesExec.slice(START_WITHOUT_INSTANCE_STRING).map((value, idx) => {
			const field = FIELDS[formatName][idx];

			let _value;

			if (_formats[field] instanceof Function) {
				_value = _formats[field](value);
			} else {
				_value = value;
			}

			return [field, _value];
		}),
	) as unknown as ParsedCLF;

	return formatted;
};
