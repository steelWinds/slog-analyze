import { Logger, log } from '@/utils/logger/index.ts';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import chalk from 'chalk';
import { consola } from 'consola';
import { faker } from '@faker-js/faker';

vi.mock('consola', () => {
	const consola = {
		error: vi.fn(),
		info: vi.fn(),
		prompt: vi.fn(),
		start: vi.fn(),
		success: vi.fn(),
		warn: vi.fn(),
	};

	return { consola: consola };
});

vi.mock('chalk', () => {
	const chalk = {
		cyan: vi.fn((msg) => `cyan:${msg}`),
		green: vi.fn((msg) => `green:${msg}`),
		magenta: vi.fn((msg) => `magenta:${msg}`),
		red: vi.fn((msg) => `red:${msg}`),
		yellow: vi.fn((msg) => `yellow:${msg}`),
	};

	return { default: chalk };
});

describe('Logger', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('log should call consola.info with chalk cyan', () => {
		const msg = faker.lorem.sentence();
		Logger.log(msg);
		expect(chalk.cyan).toHaveBeenCalledWith(msg);
		expect(consola.info).toHaveBeenCalledWith(`cyan:${msg}`);
	});

	test('start should call consola.start with chalk magenta', () => {
		const msg = faker.lorem.sentence();
		Logger.start(msg);
		expect(chalk.magenta).toHaveBeenCalledWith(msg);
		expect(consola.start).toHaveBeenCalledWith(`magenta:${msg}`);
	});

	test('warn should call consola.warn with chalk yellow', () => {
		const msg = faker.lorem.sentence();
		Logger.warn(msg);
		expect(chalk.yellow).toHaveBeenCalledWith(msg);
		expect(consola.warn).toHaveBeenCalledWith(`yellow:${msg}`);
	});

	test('success should call consola.success with chalk green', () => {
		const msg = faker.lorem.sentence();
		Logger.success(msg);
		expect(chalk.green).toHaveBeenCalledWith(msg);
		expect(consola.success).toHaveBeenCalledWith(`green:${msg}`);
	});

	test('error should call consola.error with chalk red', () => {
		const msg = faker.lorem.sentence();
		Logger.error(msg);
		expect(chalk.red).toHaveBeenCalledWith(msg);
		expect(consola.error).toHaveBeenCalledWith(`red:${msg}`);
	});

	test('prompt should call consola.prompt with given arguments', () => {
		const args = [faker.lorem.word(), { type: 'text' }] as const;
		Logger.prompt(...args);
		expect(consola.prompt).toHaveBeenCalledWith(...args);
	});
});

describe('log decorator', () => {
	const originalEnv = import.meta.env.TSDOWN_MODE;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		// @ts-ignore
		import.meta.env.TSDOWN_MODE = originalEnv;
	});

	test('should log entry and exit for sync method', () => {
		class TestClass {
			@log
			syncMethod(msg: string) {
				return `sync:${msg}`;
			}
		}

		const instance = new TestClass();
		const msg = faker.lorem.word();

		const result = instance.syncMethod(msg);

		expect(result).toBe(`sync:${msg}`);
		expect(consola.start).toHaveBeenCalledWith(
			'magenta:Entering method syncMethod',
		);
		expect(consola.info).toHaveBeenCalledWith('cyan:Exiting method syncMethod');
	});

	test('should log entry and exit for async method', async () => {
		class TestClass {
			@log
			async asyncMethod(msg: string) {
				return Promise.resolve(`async:${msg}`);
			}
		}

		const instance = new TestClass();
		const msg = faker.lorem.word();

		const result = await instance.asyncMethod(msg);

		expect(result).toBe(`async:${msg}`);
		expect(consola.start).toHaveBeenCalledWith(
			'magenta:Entering method asyncMethod',
		);
		expect(consola.info).toHaveBeenCalledWith(
			'cyan:Exiting method asyncMethod',
		);
	});

	test('should log error for sync method that throws', () => {
		class TestClass {
			@log
			syncErrorMethod() {
				throw new Error('sync error');
			}
		}

		const instance = new TestClass();

		expect(() => instance.syncErrorMethod()).toThrow('sync error');
		expect(consola.start).toHaveBeenCalledWith(
			'magenta:Entering method syncErrorMethod',
		);
		expect(consola.error).toHaveBeenCalledWith(
			'red:Error in method syncErrorMethod: sync error',
		);
	});

	test('should log error for async method that rejects', async () => {
		class TestClass {
			@log
			async asyncErrorMethod() {
				throw new Error('async error');
			}
		}

		const instance = new TestClass();

		await expect(instance.asyncErrorMethod()).rejects.toThrow('async error');
		expect(consola.start).toHaveBeenCalledWith(
			'magenta:Entering method asyncErrorMethod',
		);
		expect(consola.error).toHaveBeenCalledWith(
			'red:Error in method asyncErrorMethod: async error',
		);
	});

	test('should not wrap method in production mode', () => {
		// @ts-ignore
		import.meta.env.TSDOWN_MODE = 'production';

		const originalMethod = vi.fn(() => 'original');
		const descriptor = {
			value: originalMethod,
		};
		const target = {};
		const propertyKey = faker.lorem.word();

		const result = log(target, propertyKey, descriptor);

		expect(result).toBeUndefined();
		expect(descriptor.value).toBe(originalMethod);
	});
});
