import { expect, test } from 'vitest';
import { faker } from '@faker-js/faker/locale/en';
import { parseCLFLine } from '@/utils/parseCLFLine/index.ts';

test('Parse valid CLF Lines', async () => {
	const logLineCombined =
		'127.0.0.1 - - [23/Jan/2026:15:30:45 +0300] "GET /index.html HTTP/1.1" 200 1234 "https://example.com/" "Mozilla/5.0..."';
	const logLineBasic =
		'127.0.0.1 - - [23/Jan/2026:15:30:45 +0300] "GET /index.html HTTP/1.1" 200 1234';

	expect(parseCLFLine(logLineBasic)).toStrictEqual({
		authUser: '-',
		bytesSent: '1234',
		dateTime: '23/Jan/2026:15:30:45 +0300',
		remoteHost: '127.0.0.1',
		request: 'GET /index.html HTTP/1.1',
		rfc931: '-',
		statusCode: '200',
	});

	expect(parseCLFLine(logLineCombined)).toStrictEqual({
		authUser: '-',
		bytesSent: '1234',
		dateTime: '23/Jan/2026:15:30:45 +0300',
		referrer: 'https://example.com/',
		remoteHost: '127.0.0.1',
		request: 'GET /index.html HTTP/1.1',
		rfc931: '-',
		statusCode: '200',
		userAgent: 'Mozilla/5.0...',
	});
});

test('Parse invalid string', () => {
	// oxlint-disable-next-line no-magic-numbers
	const invalidLogLine = faker.lorem.words(10);

	expect(parseCLFLine(invalidLogLine)).toBe(null);
});
