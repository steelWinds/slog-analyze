import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fs, vol } from 'memfs';
import { FileStreamService } from '@/services/fs/index.ts';
import { faker } from '@faker-js/faker/locale/en';
import { format } from 'path';

vi.mock('node:fs');
vi.mock('node:fs/promises');

beforeEach(() => {
	vol.reset();
});

describe('FileStreamService', () => {
	describe('transformTextStream', () => {
		test('successfully transforms text stream with highWaterMark', async () => {
			const msg = faker.lorem.text();
			const msgDivider = 4;
			const highWaterMark = Math.round(msg.length / msgDivider);

			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, msg);

			const fsService = new FileStreamService();
			const transformMock = vi.fn((chunk) => chunk);

			await fsService.transformTextStream({
				from: pathInputFile,
				options: {
					encoding: 'utf-8',
					read: { highWaterMark },
					write: { highWaterMark },
				},
				to: pathOutputFile,
				transform: transformMock,
			});

			const text = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(text).toBe(msg);
			expect(transformMock).toHaveBeenCalled();
		});

		test('reads file line by line when readline option is true', async () => {
			const lines = ['first line', 'second line', 'third line'];
			const content = lines.join('\n');

			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, content);

			const fsService = new FileStreamService();
			const transformMock = vi.fn((line) => `${line}\n`);

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { readline: true },
				to: pathOutputFile,
				transform: transformMock,
			});

			const output = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(output).toBe(`${content}\n`);
			expect(transformMock).toHaveBeenCalledTimes(3);
			expect(transformMock).toHaveBeenCalledWith('first line');
			expect(transformMock).toHaveBeenCalledWith('second line');
			expect(transformMock).toHaveBeenCalledWith('third line');
		});

		test('handles empty file with readline option', async () => {
			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, '');

			const fsService = new FileStreamService();
			const transformMock = vi.fn();

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { readline: true },
				to: pathOutputFile,
				transform: transformMock,
			});

			const output = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(output).toBe('');
			expect(transformMock).not.toHaveBeenCalled();
		});

		test('processes file with CRLF line endings when readline is true', async () => {
			const lines = ['first line', 'second line', 'third line'];
			const content = lines.join('\r\n');

			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, content);

			const fsService = new FileStreamService();
			const transformMock = vi.fn((line) => `${line}\n`);

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { readline: true },
				to: pathOutputFile,
				transform: transformMock,
			});

			const output = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(output).toBe('first line\nsecond line\nthird line\n');
			expect(transformMock).toHaveBeenCalledTimes(3);
		});

		test('handles transform errors for specific lines when readline is true', async () => {
			const lines = ['first line', 'second line', 'third line'];
			const content = lines.join('\n');

			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, content);

			const fsService = new FileStreamService();
			const error = new Error('Transform error');
			const onTransformError = vi.fn();

			let callCount = 0;
			const transformMock = vi.fn(() => {
				callCount++;
				if (callCount === 2) {
					throw error;
				}
				return 'transformed\n';
			});

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { onTransformError, readline: true },
				to: pathOutputFile,
				transform: transformMock,
			});

			expect(onTransformError).toHaveBeenCalledTimes(1);
			expect(onTransformError.mock.calls[0][0]).toBe('second line');
			expect(onTransformError.mock.calls[0][1]).toBe(error);
		});

		test('handles transform errors with onTransformError callback', async () => {
			const msg = faker.lorem.text();
			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, msg);

			const fsService = new FileStreamService();
			const error = new Error('Transform error');
			const onTransformError = vi.fn();

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { onTransformError },
				to: pathOutputFile,
				transform: vi.fn(() => {
					throw error;
				}),
			});

			expect(onTransformError).toHaveBeenCalledTimes(1);
			expect(onTransformError.mock.calls[0][1]).toBe(error);
		});

		test('propagates transform errors without onTransformError callback', async () => {
			const msg = faker.lorem.text();
			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, msg);

			const fsService = new FileStreamService();

			await expect(
				fsService.transformTextStream({
					from: pathInputFile,
					to: pathOutputFile,
					transform: vi.fn(() => {
						throw new Error('Transform error');
					}),
				}),
			).rejects.toThrow('Transform error');
		});

		test('respects custom encoding settings', async () => {
			const msg = faker.lorem.text();
			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, msg, { encoding: 'utf-8' });

			const fsService = new FileStreamService();
			const transformMock = vi.fn((chunk) => chunk);

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { encoding: 'utf-8' },
				to: pathOutputFile,
				transform: transformMock,
			});

			const text = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(text).toBe(msg);
		});

		test('handles empty file transformation', async () => {
			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, '');

			const fsService = new FileStreamService();
			const transformMock = vi.fn((chunk) => chunk);

			await fsService.transformTextStream({
				from: pathInputFile,
				to: pathOutputFile,
				transform: transformMock,
			});

			const text = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(text).toBe('');
			expect(transformMock).not.toHaveBeenCalled();
		});

		test('handles pipeline errors with onError callback', async () => {
			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			const fsService = new FileStreamService();
			const onErrorMock = vi.fn();

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { onError: onErrorMock },
				to: pathOutputFile,
				transform: vi.fn((chunk) => chunk),
			});

			expect(onErrorMock).toHaveBeenCalledTimes(1);
			expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(Error);
		});

		test('propagates pipeline errors without onError callback', async () => {
			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			const fsService = new FileStreamService();

			await expect(
				fsService.transformTextStream({
					from: pathInputFile,
					to: pathOutputFile,
					transform: vi.fn((chunk) => chunk),
				}),
			).rejects.toThrow();
		});

		test('processes large text in multiple chunks', async () => {
			const msg = faker.lorem.paragraphs(50);
			const highWaterMark = 1024;
			let chunkCount = 0;

			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, msg);

			const fsService = new FileStreamService();

			await fsService.transformTextStream({
				from: pathInputFile,
				options: {
					read: { highWaterMark },
					write: { highWaterMark },
				},
				to: pathOutputFile,
				transform: (chunk) => {
					chunkCount++;
					expect(chunk.length).toBeLessThanOrEqual(highWaterMark);
					return chunk;
				},
			});

			const text = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(text).toBe(msg);
			expect(chunkCount).toBeGreaterThan(1);
		});

		test('applies transform function to each chunk', async () => {
			const msg = 'hello world';
			const expected = 'HELLO WORLD';

			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, msg);

			const fsService = new FileStreamService();

			await fsService.transformTextStream({
				from: pathInputFile,
				to: pathOutputFile,
				transform: (chunk) => chunk.toUpperCase(),
			});

			const text = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(text).toBe(expected);
		});

		test('applies transform function to each line', async () => {
			const lines = ['hello', 'world', 'test'];
			const content = lines.join('\n');
			const expected = 'HELLO\nWORLD\nTEST\n';

			const pathInputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});
			const pathOutputFile = format({
				base: faker.system.commonFileName('txt'),
				root: '/',
			});

			fs.writeFileSync(pathInputFile, content);

			const fsService = new FileStreamService();

			await fsService.transformTextStream({
				from: pathInputFile,
				options: { readline: true },
				to: pathOutputFile,
				transform: (line) => `${line.toUpperCase()}\n`,
			});

			const text = fs.readFileSync(pathOutputFile, 'utf-8');
			expect(text).toBe(expected);
		});
	});
});
