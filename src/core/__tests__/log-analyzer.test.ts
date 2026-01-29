import { beforeEach, describe, expect, test } from 'vitest';
import { LogAnalyzer } from '@/core/log-analyzer/index.ts';
import type { LogEntry } from '@/core/log-analyzer/types.ts';
import { faker } from '@faker-js/faker';

describe('LogAnalyzer', () => {
	let analyzer: LogAnalyzer;
	let mockEntry: LogEntry;

	beforeEach(() => {
		analyzer = new LogAnalyzer();
		mockEntry = {
			authUser: faker.string.alphanumeric(6),
			bytesSent: faker.string.numeric(4),
			dateTime: faker.date.recent().toISOString(),
			remoteHost: faker.internet.ip(),
			request: faker.internet.url(),
			rfc931: faker.string.alphanumeric(8),
			statusCode: faker.string.numeric(3),
		};
	});

	describe('constructor and reset', () => {
		test('should initialize with empty state', () => {
			const result = analyzer.getResult();

			expect(result.totalRequests).toBe(0);
			expect(result.uniqueRemoteHostsCount).toBe(0);
			expect(result.topRequests).toEqual([]);
			expect(result.topTrafficHours).toEqual([]);
			expect(result.topStatusCodes).toEqual([]);
		});

		test('should reset state correctly', () => {
			analyzer.combine(mockEntry);
			analyzer.reset();

			const result = analyzer.getResult();
			expect(result.totalRequests).toBe(0);
			expect(result.uniqueRemoteHostsCount).toBe(0);
		});
	});

	describe('combine', () => {
		test('should increment totalRequests', () => {
			analyzer.combine(mockEntry);
			expect(analyzer.getResult().totalRequests).toBe(1);

			analyzer.combine(mockEntry);
			expect(analyzer.getResult().totalRequests).toBe(2);
		});

		test('should track unique remote hosts', () => {
			const host1 = faker.internet.ip();
			const host2 = faker.internet.ip();

			analyzer.combine({ ...mockEntry, remoteHost: host1 });
			analyzer.combine({ ...mockEntry, remoteHost: host1 });
			analyzer.combine({ ...mockEntry, remoteHost: host2 });

			expect(analyzer.getResult().uniqueRemoteHostsCount).toBe(2);
		});

		test('should count requests by path', () => {
			const request1 = '/api/users';
			const request2 = '/api/products';

			analyzer.combine({ ...mockEntry, request: request1 });
			analyzer.combine({ ...mockEntry, request: request1 });
			analyzer.combine({ ...mockEntry, request: request2 });

			const result = analyzer.getResult();
			expect(result.topRequests).toEqual([
				[request1, 2],
				[request2, 1],
			]);
		});

		test('should count traffic by hour', () => {
			const date1 = new Date('2024-01-01T10:30:00Z');
			const date2 = new Date('2024-01-01T10:45:00Z');
			const date3 = new Date('2024-01-01T14:20:00Z');

			analyzer.combine({ ...mockEntry, dateTime: date1.toISOString() });
			analyzer.combine({ ...mockEntry, dateTime: date2.toISOString() });
			analyzer.combine({ ...mockEntry, dateTime: date3.toISOString() });

			const result = analyzer.getResult();

			expect(result.topTrafficHours).toEqual([
				['10', 2],
				['14', 1],
			]);
		});

		test('should count status codes', () => {
			analyzer.combine({ ...mockEntry, statusCode: '200' });
			analyzer.combine({ ...mockEntry, statusCode: '200' });
			analyzer.combine({ ...mockEntry, statusCode: '404' });
			analyzer.combine({ ...mockEntry, statusCode: '500' });

			const result = analyzer.getResult();
			expect(result.topStatusCodes).toEqual([
				['200', 2],
				['404', 1],
				['500', 1],
			]);
		});

		test('should handle missing optional fields', () => {
			const minimalEntry: LogEntry = {
				authUser: '',
				bytesSent: '0',
				dateTime: faker.date.recent().toISOString(),
				remoteHost: faker.internet.ip(),
				request: faker.internet.url(),
				rfc931: '',
				statusCode: '200',
			};

			expect(() => analyzer.combine(minimalEntry)).not.toThrow();
		});
	});

	describe('getResult', () => {
		test('should sort results in descending order', () => {
			analyzer.combine({ ...mockEntry, request: '/api/a', statusCode: '200' });
			analyzer.combine({ ...mockEntry, request: '/api/b', statusCode: '200' });
			analyzer.combine({ ...mockEntry, request: '/api/b', statusCode: '404' });
			analyzer.combine({ ...mockEntry, request: '/api/b', statusCode: '404' });
			analyzer.combine({ ...mockEntry, request: '/api/b', statusCode: '404' });

			const result = analyzer.getResult();

			expect(result.topStatusCodes[0][0]).toBe('404');
			expect(result.topStatusCodes[0][1]).toBe(3);
			expect(result.topStatusCodes[1][0]).toBe('200');
			expect(result.topStatusCodes[1][1]).toBe(2);
		});

		test('should return correct structure', () => {
			analyzer.combine(mockEntry);
			const result = analyzer.getResult();

			expect(result).toHaveProperty('totalRequests');
			expect(result).toHaveProperty('uniqueRemoteHostsCount');
			expect(result).toHaveProperty('topRequests');
			expect(result).toHaveProperty('topTrafficHours');
			expect(result).toHaveProperty('topStatusCodes');

			expect(Array.isArray(result.topRequests)).toBe(true);
			expect(Array.isArray(result.topTrafficHours)).toBe(true);
			expect(Array.isArray(result.topStatusCodes)).toBe(true);
		});
	});

	describe('_mutationIncrementValue', () => {
		test('should increment existing keys', () => {
			const record: Record<string, number> = { test: 1 };
			const key = 'test';

			analyzer['_mutationIncrementValue'](record, key);
			expect(record[key]).toBe(2);
		});

		test('should initialize new keys', () => {
			const record: Record<string, number> = {};
			const key = 'test';

			analyzer['_mutationIncrementValue'](record, key);
			expect(record[key]).toBe(1);
		});
	});

	describe('_sortDesc', () => {
		test('should sort entries by value descending', () => {
			const input = { a: 3, b: 1, c: 2 };
			const result = analyzer['_sortDesc'](input);

			expect(result).toEqual([
				['a', 3],
				['c', 2],
				['b', 1],
			]);
		});

		test('should handle empty object', () => {
			const result = analyzer['_sortDesc']({});
			expect(result).toEqual([]);
		});
	});
});
