import { FIELDS, FORMATS } from '@/utils/parseCLFLine/constants.ts';
import type { FormatCLF } from '@/utils/parseCLFLine/types.ts';

export function parseCLFLine(line: string) {
  let matchesExec: RegExpExecArray | null = null
  let formatName: FormatCLF | null = null

  for (const [key, regexp] of Object.entries(FORMATS) as [FormatCLF, RegExp][]) {
    matchesExec = regexp.exec(line)

    if (matchesExec) {
      formatName = key

      break
    }
  }

  if (!matchesExec || !formatName) {
    return null
  }

  const formatted = Object.fromEntries(
    matchesExec
      .slice(1)
      .map((value, idx) => [FIELDS[formatName][idx], value])
  )

  return formatted
}
