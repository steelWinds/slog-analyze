import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { FileStreamService } from 'src/services/fs/index.ts';
import { LogAnalyzer } from 'src/core/logAnalyzer/index.ts';
import { analyze } from 'src/cli/commands/analyze/index.ts';
import { faker } from '@faker-js/faker';
import { parseCLFLine } from 'src/utils/parseCLFLine/index.ts';
import { vol } from 'memfs';

vi.mock('node:fs');
vi.mock('node:fs/promises');

vi.mock(import('src/utils/logger/index.ts'), { spy: true });

vi.mock(import('src/services/fs/index.ts'), { spy: true });

vi.mock(import('src/core/logAnalyzer/index.ts'), { spy: true });

vi.mock(import('src/utils/parseCLFLine/index.ts'), { spy: true });

vi.mock(import('yocto-spinner'), { spy: true });

describe('analyze', () => {
	const TEST_DIR = '/test';
	const TEST_FILE_FROM = `${TEST_DIR}/from.txt`;
	const TEST_FILE_TO = `${TEST_DIR}/to.json`;
	const TEST_CONTENT = `192.168.1.1 - alice [02/Sep/2024:23:21:22 +0000] "GET /images/logo.png HTTP/1.1" 301 4573\n198.51.100.7 - admin [04/Sep/2024:17:44:15 +0000] "DELETE /index.html HTTP/1.1" 500 1291 "https://github.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"`;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		vol.reset();
		vol.mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('should instantiate FileStreamService and LogAnalyzer', async () => {
		vol.writeFileSync(TEST_FILE_FROM, TEST_CONTENT);
		vol.writeFileSync(TEST_FILE_TO, TEST_CONTENT);

		await analyze(TEST_FILE_FROM, TEST_FILE_TO);

		expect(FileStreamService).toHaveBeenCalledTimes(1);
		expect(LogAnalyzer).toHaveBeenCalledTimes(1);
	});

	test('should start process', async () => {
		vol.writeFileSync(TEST_FILE_FROM, TEST_CONTENT);
		vol.writeFileSync(TEST_FILE_TO, '');

		await analyze(TEST_FILE_FROM, TEST_FILE_TO);

		expect(FileStreamService.prototype.readTextFile).toHaveBeenCalled();
		expect(parseCLFLine).toHaveBeenCalled();
		expect(LogAnalyzer.prototype.combine).toHaveBeenCalled();
		expect(LogAnalyzer.prototype.getResult).toHaveBeenCalledTimes(1);
	});

	test('should handle failure', async () => {
		vol.writeFileSync(TEST_FILE_FROM, faker.lorem.words(10));
		vol.writeFileSync(TEST_FILE_TO, '');

		await expect(
			async () => await analyze(TEST_FILE_FROM, TEST_FILE_TO),
		).rejects.toThrowError();
	});
});
