import { beforeEach, describe, expect, test, vi } from 'vitest';
import { FileStreamService } from 'src/services/fs/index.ts';
import { faker } from '@faker-js/faker';
import { performance } from 'perf_hooks';
import { vol } from 'memfs';

vi.mock('node:fs');
vi.mock('node:fs/promises');

describe('FileStreamService', () => {
	let fs: FileStreamService;

	const TEST_DIR = '/test';
	const TEST_FILE = `${TEST_DIR}/test.txt`;
	const LARGE_TEST_FILE = `${TEST_DIR}/large.txt`;

	beforeEach(() => {
		fs = new FileStreamService();
		vol.reset();
		vol.mkdirSync(TEST_DIR, { recursive: true });
	});

	describe('readTextFile', () => {
		test('should initiate file reading without transformation', async () => {
			const content = faker.lorem.paragraphs(3);

			vol.writeFileSync(TEST_FILE, content);

			const mockCallback = vi.fn((chunk) => chunk);

			await fs.readTextFile({
				from: TEST_FILE,
				transformOptions: {
					callback: mockCallback,
				},
			});

			expect(mockCallback).toHaveBeenCalled();
		});

		test('should process file with encoding transformation', async () => {
			const content = faker.lorem.paragraphs(2);
			vol.writeFileSync(TEST_FILE, content);

			const mockCallback = vi.fn((chunk) => chunk);

			await fs.readTextFile({
				from: TEST_FILE,
				transformOptions: {
					callback: mockCallback,
					encoding: 'utf-8',
				},
			});

			expect(mockCallback).toHaveBeenCalled();
		});

		test('should process file line by line when readline option is true', async () => {
			const lines = [
				faker.lorem.sentence(),
				faker.lorem.sentence(),
				faker.lorem.sentence(),
			];

			const content = lines.join('\n');

			vol.writeFileSync(TEST_FILE, content);

			const processedLines: string[] = [];
			const mockCallback = vi.fn((chunk) => {
				processedLines.push(chunk);
				return chunk.toUpperCase();
			});

			await fs.readTextFile({
				from: TEST_FILE,
				transformOptions: {
					callback: mockCallback,
					readline: true,
				},
			});

			expect(processedLines).toHaveLength(lines.length);
			expect(processedLines.every((line, i) => line === lines[i])).toBe(true);
		});

		test('should handle transformation errors with onTransformError callback', async () => {
			const content = faker.lorem.paragraph();
			vol.writeFileSync(TEST_FILE, content);

			const errors: Array<{ chunk: Buffer; err: unknown }> = [];
			const mockCallback = vi.fn(() => {
				throw new Error('Test error');
			});

			await fs.readTextFile({
				from: TEST_FILE,
				transformOptions: {
					callback: mockCallback,
					onTransformError: (chunk: Buffer, err: unknown) => {
						errors.push({ chunk, err });
					},
				},
			});

			expect(errors.length).toBeGreaterThan(0);
		});
	});

	describe('writeTextFile', () => {
		test('should write string source to file', async () => {
			const content = faker.lorem.paragraphs(5);
			const outputFile = `${TEST_DIR}/output.txt`;

			await fs.writeTextFile({
				source: content,
				to: outputFile,
			});

			const readContent = vol.readFileSync(outputFile).toString();

			expect(readContent).toBe(content);
		});

		test('should write string source with transformation', async () => {
			const content = faker.lorem.paragraphs(3);
			const outputFile = `${TEST_DIR}/output.txt`;

			const mockCallback = vi.fn((chunk) => chunk.toUpperCase());

			await fs.writeTextFile({
				source: content,
				to: outputFile,
				transformOptions: {
					callback: mockCallback,
				},
			});

			const readContent = vol.readFileSync(outputFile).toString();

			expect(mockCallback).toHaveBeenCalled();
			expect(readContent).toBe(content.toUpperCase());
		});

		test('should write ReadableStream source to file', async () => {
			const chunks = [
				faker.lorem.sentence(),
				faker.lorem.sentence(),
				faker.lorem.sentence(),
			];
			const stream = new ReadableStream({
				start(controller) {
					chunks.forEach((chunk) =>
						controller.enqueue(new TextEncoder().encode(chunk)),
					);
					controller.close();
				},
			});

			const outputFile = `${TEST_DIR}/stream_output.txt`;

			await fs.writeTextFile({
				options: {
					bufferChunkSize: 16,
				},
				source: stream,
				to: outputFile,
			});

			const readContent = vol.readFileSync(outputFile).toString();

			expect(readContent).toBe(chunks.join(''));
		});
	});

	describe('stress tests', () => {
		const FILE_SIZES = {
			LARGE: 50 * 1024 * 1024,
			MEDIUM: 10 * 1024 * 1024,
			SMALL: 1024 * 1024,
		};

		const generateLargeContent = (sizeInBytes: number): string => {
			const chunk = faker.lorem.paragraphs(100);
			const repeats = Math.ceil(
				sizeInBytes / Buffer.byteLength(chunk, 'utf-8'),
			);
			return chunk.repeat(repeats).slice(0, sizeInBytes);
		};

		test.each([
			['1MB', FILE_SIZES.SMALL],
			['10MB', FILE_SIZES.MEDIUM],
			['50MB', FILE_SIZES.LARGE],
		])('should process %s file efficiently', async (sizeLabel, fileSize) => {
			const content = generateLargeContent(fileSize);
			vol.writeFileSync(LARGE_TEST_FILE, content);

			let processedBytes = 0;
			const startTime = performance.now();

			await fs.readTextFile({
				from: LARGE_TEST_FILE,
				transformOptions: {
					callback: (chunk) => {
						processedBytes += chunk.length;
						return chunk;
					},
				},
			});

			const endTime = performance.now();
			const processingTime = endTime - startTime;
			const processingSpeed = fileSize / 1024 / 1024 / (processingTime / 1000);

			console.log(
				`${sizeLabel} processing: ${processingTime.toFixed(2)}ms, Speed: ${processingSpeed.toFixed(2)} MB/s`,
			);
			expect(processedBytes).toBeGreaterThan(0);
			expect(processingTime).toBeLessThan(fileSize / 1024);
		});

		test('should process large file line by line efficiently', async () => {
			const lines = Array.from({ length: 50000 }, () => faker.lorem.sentence());
			const content = lines.join('\n');
			vol.writeFileSync(LARGE_TEST_FILE, content);

			let lineCount = 0;
			const startTime = performance.now();

			await fs.readTextFile({
				from: LARGE_TEST_FILE,
				transformOptions: {
					callback: () => {
						lineCount++;
						return '';
					},
					readline: true,
				},
			});

			const endTime = performance.now();
			const processingTime = endTime - startTime;
			expect(lineCount).toBe(lines.length);

			const linesPerSecond = lines.length / (processingTime / 1000);
			console.log(
				`Line processing performance: ${linesPerSecond.toFixed(0)} lines/sec`,
			);
			expect(linesPerSecond).toBeGreaterThan(10000);
		});

		test('should write large file with chunked processing efficiently', async () => {
			const content = generateLargeContent(FILE_SIZES.LARGE);
			const outputFile = `${TEST_DIR}/large_output.txt`;

			const startTime = performance.now();

			await fs.writeTextFile({
				options: {
					bufferChunkSize: 64,
				} as any,
				source: content,
				to: outputFile,
			});

			const endTime = performance.now();
			const writeTime = endTime - startTime;
			const writeSpeed = FILE_SIZES.LARGE / 1024 / 1024 / (writeTime / 1000);

			console.log(
				`Large file write performance: ${writeTime.toFixed(2)}ms, Speed: ${writeSpeed.toFixed(2)} MB/s`,
			);
			expect(writeTime).toBeLessThan(FILE_SIZES.LARGE / 1024);
		});
	});
});
