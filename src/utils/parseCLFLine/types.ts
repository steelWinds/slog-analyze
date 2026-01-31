import { FORMATS } from 'src/utils/parseCLFLine/constants.ts';

export type FormatCLF = keyof typeof FORMATS;

export interface ParsedCLF {
	remoteHost: string;
	rfc931: string;
	authUser: string;
	dateTime: Date;
	request: string;
	statusCode: string | number;
	bytesSent: string | number;
	referrer?: string;
	userAgent?: string;
}
