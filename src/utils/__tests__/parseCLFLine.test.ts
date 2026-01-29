import {
	FIELDS,
	FORMATS,
	START_WITHOUT_INSTANCE_STRING,
} from '@/utils/parseCLFLine/constants.ts';
import { describe, expect, it } from 'vitest';
import { DEFAULT_FORMATS } from '@/utils/parseCLFLine/config.ts';
import type { ParsedCLF } from '@/utils/parseCLFLine/types.ts';
import { faker } from '@faker-js/faker';
import { parseCLFLine } from '@/utils/parseCLFLine/index.ts';

describe('parseCLFLine constants', () => {
	it('should have correct FORMATS', () => {
		expect(FORMATS.BASIC).toBeInstanceOf(RegExp);
		expect(FORMATS.COMBINED).toBeInstanceOf(RegExp);
	});

	it('should have correct FIELDS', () => {
		expect(FIELDS.BASIC).toEqual([
			'remoteHost',
			'rfc931',
			'authUser',
			'dateTime',
			'request',
			'statusCode',
			'bytesSent',
		]);
		expect(FIELDS.COMBINED).toEqual([
			'remoteHost',
			'rfc931',
			'authUser',
			'dateTime',
			'request',
			'statusCode',
			'bytesSent',
			'referrer',
			'userAgent',
		]);
	});

	it('should have correct START_WITHOUT_INSTANCE_STRING', () => {
		expect(START_WITHOUT_INSTANCE_STRING).toBe(1);
	});
});

describe('parseCLFLine', () => {
	const generateBasicCLF = (
		overrides?: Partial<Record<keyof ParsedCLF, string>>,
	) => {
		const remoteHost = overrides?.remoteHost || faker.internet.ip();
		const rfc931 = overrides?.rfc931 || '-';
		const authUser = overrides?.authUser || '-';
		const dateTime =
			overrides?.dateTime ||
			`[${faker.date.recent().toUTCString().replace('GMT', '+0000')}]`;
		const request =
			overrides?.request ||
			`"${faker.internet.httpMethod()} ${faker.internet.url()} HTTP/1.1"`;
		const statusCode =
			overrides?.statusCode ||
			faker.helpers.arrayElement(['200', '404', '500', '301']);
		const bytesSent =
			overrides?.bytesSent ||
			faker.number.int({ max: 9999, min: 0 }).toString();

		return `${remoteHost} ${rfc931} ${authUser} ${dateTime} ${request} ${statusCode} ${bytesSent}`;
	};

	const generateCombinedCLF = (
		overrides?: Partial<Record<keyof ParsedCLF, string>>,
	) => {
		const basic = generateBasicCLF(overrides);
		const referrer = overrides?.referrer || `"${faker.internet.url()}"`;
		const userAgent = overrides?.userAgent || `"${faker.internet.userAgent()}"`;

		return `${basic} ${referrer} ${userAgent}`;
	};

	it('should return null for empty string', () => {
		expect(parseCLFLine('')).toBeNull();
	});

	it('should return null for malformed string', () => {
		expect(parseCLFLine(faker.lorem.sentence())).toBeNull();
	});

	it('should correctly parse BASIC format', () => {
		const remoteHost = faker.internet.ip();
		const rfc931 = faker.string.alphanumeric(5);
		const authUser = faker.internet.username();
		const dateString = faker.date
			.recent()
			.toUTCString()
			.replace('GMT', '+0000');
		const dateTime = `[${dateString}]`;
		const request = `"GET /index.html HTTP/1.1"`;
		const statusCode = '200';
		const bytesSent = '1234';

		const line = `${remoteHost} ${rfc931} ${authUser} ${dateTime} ${request} ${statusCode} ${bytesSent}`;
		const result = parseCLFLine(line);

		expect(result).toEqual({
			authUser,
			bytesSent: 1234,
			dateTime: DEFAULT_FORMATS.dateTime(dateString),
			remoteHost,
			request: request.slice(1, -1),
			rfc931,
			statusCode: 200,
		});
	});

	it('should correctly parse COMBINED format', () => {
		const remoteHost = faker.internet.ip();
		const rfc931 = '-';
		const authUser = faker.internet.username();
		const dateString = faker.date
			.recent()
			.toUTCString()
			.replace('GMT', '+0000');
		const dateTime = `[${dateString}]`;
		const request = `"POST /api/data HTTP/1.0"`;
		const statusCode = '404';
		const bytesSent = '0';
		const referrer = `"${faker.internet.url()}"`;
		const userAgent = `"${faker.internet.userAgent()}"`;

		const line = `${remoteHost} ${rfc931} ${authUser} ${dateTime} ${request} ${statusCode} ${bytesSent} ${referrer} ${userAgent}`;
		const result = parseCLFLine(line);

		expect(result).toEqual({
			authUser,
			bytesSent: 0,
			dateTime: DEFAULT_FORMATS.dateTime(dateString),
			referrer: referrer.slice(1, -1),
			remoteHost,
			request: request.slice(1, -1),
			rfc931,
			statusCode: 404,
			userAgent: userAgent.slice(1, -1),
		});
	});

	it('should handle dashes in fields correctly', () => {
		const dateString = faker.date
			.recent()
			.toUTCString()
			.replace('GMT', '+0000');
		const line = `- - - [${dateString}] "-" 000 -`;
		const result = parseCLFLine(line);

		expect(result).toEqual({
			authUser: '-',
			bytesSent: NaN,
			dateTime: DEFAULT_FORMATS.dateTime(dateString),
			remoteHost: '-',
			request: '-',
			rfc931: '-',
			statusCode: 0,
		});
	});

	it('should parse multiple random BASIC lines', () => {
		for (let i = 0; i < 10; i++) {
			const line = generateBasicCLF();
			const result = parseCLFLine(line);

			expect(result).toBeTruthy();
			expect(result).toHaveProperty('remoteHost');
			expect(result).toHaveProperty('statusCode');
			expect(typeof result?.statusCode).toBe('number');
			expect(result).toHaveProperty('bytesSent');
			expect(typeof result?.bytesSent).toBe('number');
			expect(result?.dateTime).toBeInstanceOf(Date);
			expect(result?.referrer).toBeUndefined();
			expect(result?.userAgent).toBeUndefined();
		}
	});

	it('should parse multiple random COMBINED lines', () => {
		for (let i = 0; i < 10; i++) {
			const line = generateCombinedCLF();
			const result = parseCLFLine(line);

			expect(result).toBeTruthy();
			expect(result).toHaveProperty('referrer');
			expect(result).toHaveProperty('userAgent');
			expect(result?.dateTime).toBeInstanceOf(Date);
			expect(typeof result?.statusCode).toBe('number');
			expect(typeof result?.bytesSent).toBe('number');
		}
	});

	it('should handle special characters in request', () => {
		const request = `"GET /search?q=${encodeURIComponent('test&data=value')} HTTP/1.1"`;
		const line = generateBasicCLF({ request });
		const result = parseCLFLine(line);

		expect(result?.request).toBe(request.slice(1, -1));
	});

	it('should handle quotes in user agent', () => {
		const userAgent = '"Mozilla/5.0 (compatible; "Test Bot")"';
		const line = generateCombinedCLF({ userAgent });
		const result = parseCLFLine(line);

		expect(result).toBeNull();
	});

	it('should parse numeric bytesSent', () => {
		const bytesSent = faker.number.int({ max: 1000000, min: 0 }).toString();
		const line = generateBasicCLF({ bytesSent });
		const result = parseCLFLine(line);

		expect(typeof result?.bytesSent).toBe('number');
		expect(result?.bytesSent).toBe(Number(bytesSent));
	});

	it('should handle invalid bytesSent as NaN', () => {
		const bytesSent = '-';
		const line = generateBasicCLF({ bytesSent });
		const result = parseCLFLine(line);

		expect(Number.isNaN(result?.bytesSent)).toBe(true);
	});

	describe('with custom formats', () => {
		it('should use custom format function for specific field', () => {
			const customFormats = {
				authUser: (value: string) => value.toUpperCase(),
				statusCode: (value: string) => parseInt(value) * 2,
			};

			const line = generateBasicCLF({
				authUser: 'testuser',
				statusCode: '200',
			});
			const result = parseCLFLine(line, customFormats);

			expect(result?.statusCode).toBe(400);
			expect(result?.authUser).toBe('TESTUSER');
		});

		it('should merge custom formats with default formats', () => {
			const customFormats = {
				remoteHost: () => 'custom-host',
			};

			const line = generateBasicCLF();
			const result = parseCLFLine(line, customFormats);

			expect(result?.remoteHost).toBe('custom-host');
			expect(result?.dateTime).toBeInstanceOf(Date);
			expect(typeof result?.statusCode).toBe('number');
		});

		it('should handle empty custom formats object', () => {
			const line = generateBasicCLF({ statusCode: '200' });
			const result = parseCLFLine(line, {});

			expect(result?.statusCode).toBe(200);
		});

		it('should apply custom format to all fields when provided', () => {
			const customFormats = {
				authUser: () => 'custom-auth',
				bytesSent: () => 888,
				dateTime: () => new Date('2023-01-01'),
				referrer: () => 'custom-referrer',
				remoteHost: () => 'custom-remote',
				request: () => 'custom-request',
				rfc931: () => 'custom-rfc',
				statusCode: () => 999,
				userAgent: () => 'custom-agent',
			};

			const line = generateCombinedCLF();
			const result = parseCLFLine(line, customFormats);

			expect(result).toEqual({
				authUser: 'custom-auth',
				bytesSent: 888,
				dateTime: new Date('2023-01-01'),
				referrer: 'custom-referrer',
				remoteHost: 'custom-remote',
				request: 'custom-request',
				rfc931: 'custom-rfc',
				statusCode: 999,
				userAgent: 'custom-agent',
			});
		});

		it('should handle custom format that returns different types', () => {
			const customFormats = {
				bytesSent: (value: string) => `bytes-${value}`,
				statusCode: (value: string) => `code-${value}`,
			};

			const line = generateBasicCLF({ bytesSent: '1234', statusCode: '200' });
			const result = parseCLFLine(line, customFormats);

			expect(result?.statusCode).toBe('code-200');
			expect(result?.bytesSent).toBe('bytes-1234');
		});

		it('should work with partial custom formats for COMBINED format', () => {
			const customFormats = {
				referrer: () => 'no-referrer',
				userAgent: (value: string) => value.toLowerCase(),
			};

			const userAgent = `"${faker.internet.userAgent().toUpperCase()}"`;
			const line = generateCombinedCLF({ userAgent });
			const result = parseCLFLine(line, customFormats);

			expect(result?.userAgent).toBe(userAgent.slice(1, -1).toLowerCase());
			expect(result?.referrer).toBe('no-referrer');
		});
	});
});
