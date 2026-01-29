import { FORMATS } from '@/utils/parse-clf-line/constants.ts';

export type FormatCLF = keyof typeof FORMATS;

export interface ParsedCLF {
	remoteHost: string;
	rfc931: string;
	authUser: string;
	dateTime: string;
	request: string;
	statusCode: string;
	bytesSent: string;
	referrer?: string;
	userAgent?: string;
}
