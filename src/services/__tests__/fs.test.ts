import { beforeEach, expect, test, vi } from 'vitest';
import { fs, vol } from 'memfs';
import { FileStreamService } from '@/services/fs/index.ts';
import { faker } from '@faker-js/faker/locale/en';
import { format } from 'path';

vi.mock('node:fs');
vi.mock('node:fs/promises');

beforeEach(() => {
	vol.reset();
});

test('Test transform file stream', async () => {
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

	// @ts-ignore
	fs.writeFileSync(pathInputFile, msg);

	const fsService = new FileStreamService();

	await fsService.transformTextStream({
		from: pathInputFile,
		options: {
			encoding: 'utf-8',
			read: {
				highWaterMark,
			},
			write: {
				highWaterMark,
			},
		},
		to: pathOutputFile,
		transform: (chunk) => {
			expect(chunk.length).toBeLessThanOrEqual(highWaterMark);
			return chunk;
		},
	});

	// @ts-ignore
	const text = fs.readFileSync(pathOutputFile, 'utf-8');

	expect(text).toBe(msg);
});

test('Test error suppression in transform callback', async () => {
	const msg = faker.lorem.text();

	const pathInputFile = format({
		base: faker.system.commonFileName('txt'),
		root: '/',
	});
	const pathOutputFile = format({
		base: faker.system.commonFileName('txt'),
		root: '/',
	});

	// @ts-ignore
	fs.writeFileSync(pathInputFile, msg);

	const fsService = new FileStreamService();

	const err = new Error('Transform error');

	const onTransformError = vi.fn();

	await fsService.transformTextStream({
		from: pathInputFile,
		options: { onTransformError },
		to: pathOutputFile,
		transform: vi.fn(() => {
			throw err;
		}),
	});

	expect(onTransformError.mock.calls[0][1]).toBeInstanceOf(Error);
	expect(onTransformError.mock.calls[0][1].message).toBe('Transform error');
});

test('Test error thrown in transform callback', async () => {
	const msg = faker.lorem.text();

	const pathInputFile = format({
		base: faker.system.commonFileName('txt'),
		root: '/',
	});
	const pathOutputFile = format({
		base: faker.system.commonFileName('txt'),
		root: '/',
	});

	// @ts-ignore
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
