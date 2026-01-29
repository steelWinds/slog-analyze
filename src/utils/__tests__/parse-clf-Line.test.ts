import {
	FIELDS,
	FORMATS,
	START_WITHOUT_INSTANCE_STRING,
} from '@/utils/parse-clf-line/constants.ts';
import { describe, expect, test } from 'vitest';
import type { ParsedCLF } from '@/utils/parse-clf-line/types.ts';
import { faker } from '@faker-js/faker';
import { parseCLFLine } from '@/utils/parse-clf-line/index.ts';

describe('parseCLFLine constants', () => {
	test('should have correct FORMATS', () => {
		expect(FORMATS.BASIC).toBeInstanceOf(RegExp);
		expect(FORMATS.COMBINED).toBeInstanceOf(RegExp);
	});

	test('should have correct FIELDS', () => {
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

	test('should have correct START_WITHOUT_INSTANCE_STRING', () => {
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

	test('should return null for empty string', () => {
		expect(parseCLFLine('')).toBeNull();
	});

	test('should return null for malformed string', () => {
		expect(parseCLFLine(faker.lorem.sentence())).toBeNull();
	});

	test('should correctly parse BASIC format', () => {
		const remoteHost = faker.internet.ip();
		const rfc931 = faker.string.alphanumeric(5);
		const authUser = faker.internet.username();
		const dateTime = `[${faker.date.recent().toUTCString().replace('GMT', '+0000')}]`;
		const request = `"GET /index.html HTTP/1.1"`;
		const statusCode = '200';
		const bytesSent = '1234';

		const line = `${remoteHost} ${rfc931} ${authUser} ${dateTime} ${request} ${statusCode} ${bytesSent}`;
		const result = parseCLFLine(line);

		expect(result).toEqual({
			authUser,
			bytesSent,
			dateTime: dateTime.slice(1, -1),
			remoteHost,
			request: request.slice(1, -1),
			rfc931,
			statusCode,
		});
	});

	test('should correctly parse COMBINED format', () => {
		const remoteHost = faker.internet.ip();
		const rfc931 = '-';
		const authUser = faker.internet.username();
		const dateTime = `[${faker.date.recent().toUTCString().replace('GMT', '+0000')}]`;
		const request = `"POST /api/data HTTP/1.0"`;
		const statusCode = '404';
		const bytesSent = '0';
		const referrer = `"${faker.internet.url()}"`;
		const userAgent = `"${faker.internet.userAgent()}"`;

		const line = `${remoteHost} ${rfc931} ${authUser} ${dateTime} ${request} ${statusCode} ${bytesSent} ${referrer} ${userAgent}`;
		const result = parseCLFLine(line);

		expect(result).toEqual({
			authUser,
			bytesSent,
			dateTime: dateTime.slice(1, -1),
			referrer: referrer.slice(1, -1),
			remoteHost,
			request: request.slice(1, -1),
			rfc931,
			statusCode,
			userAgent: userAgent.slice(1, -1),
		});
	});

	test('should handle dashes in fields correctly', () => {
		const line = '- - - [-] "-" 000 -';
		const result = parseCLFLine(line);

		expect(result).toEqual({
			authUser: '-',
			bytesSent: '-',
			dateTime: '-',
			remoteHost: '-',
			request: '-',
			rfc931: '-',
			statusCode: '000',
		});
	});

	test('should parse multiple random BASIC lines', () => {
		for (let i = 0; i < 10; i++) {
			const line = generateBasicCLF();
			const result = parseCLFLine(line);

			expect(result).toBeTruthy();
			expect(result).toHaveProperty('remoteHost');
			expect(result).toHaveProperty('statusCode');
			expect(result).toHaveProperty('bytesSent');
			expect(result?.referrer).toBeUndefined();
			expect(result?.userAgent).toBeUndefined();
		}
	});

	test('should parse multiple random COMBINED lines', () => {
		for (let i = 0; i < 10; i++) {
			const line = generateCombinedCLF();
			const result = parseCLFLine(line);

			expect(result).toBeTruthy();
			expect(result).toHaveProperty('referrer');
			expect(result).toHaveProperty('userAgent');
		}
	});

	test('should handle special characters in request', () => {
		const request = `"GET /search?q=${encodeURIComponent('test&data=value')} HTTP/1.1"`;
		const line = generateBasicCLF({ request });
		const result = parseCLFLine(line);

		expect(result?.request).toBe(request.slice(1, -1));
	});

	test('should parse numeric bytesSent', () => {
		const bytesSent = faker.number.int({ max: 1000000, min: 0 }).toString();
		const line = generateBasicCLF({ bytesSent });
		const result = parseCLFLine(line);

		expect(result?.bytesSent).toBe(bytesSent);
	});

	test('should handle invalid bytesSent as string', () => {
		const bytesSent = '-';
		const line = generateBasicCLF({ bytesSent });
		const result = parseCLFLine(line);

		expect(result?.bytesSent).toBe('-');
	});
});
