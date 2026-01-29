import { parseDate } from 'chrono-node';

export const DEFAULT_FORMATS = {
	authUser: (value: string) => value,
	bytesSent: (value: string): string | number => Number(value),
	dateTime: (value: string) => parseDate(value) as Date,
	referrer: (value: string) => value,
	remoteHost: (value: string) => value,
	request: (value: string) => value,
	rfc931: (value: string) => value,
	statusCode: (value: string): string | number => Number(value),
	userAgent: (value: string) => value,
} as const;
