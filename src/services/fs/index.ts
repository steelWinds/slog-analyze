import type {
	ReadFileParams,
	TransformStreamParams,
	WriteFileParams,
} from '@/services/fs/types.ts';
import { ReadStream, createReadStream, createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { createInterface } from 'node:readline';
import { log } from '@/utils/logger/index.ts';
import { pipeline } from 'node:stream/promises';

export class FileStreamService {
	@log
	private _transform(params?: TransformStreamParams) {
		const {
			callback = (chunk: Buffer) => chunk,
			encoding,
			readline,
			onTransformError,
		} = params ?? {};

		return async function* (source: ReadStream) {
			if (encoding) {
				source.setEncoding('utf-8');
			}

			let _source = readline
				? createInterface({
						crlfDelay: Infinity,
						input: source,
					})
				: source;

			for await (const line of _source) {
				try {
					yield await callback(line);
				} catch (err) {
					if (onTransformError) {
						onTransformError(line, err);
					} else {
						throw err;
					}
				}
			}
		};
	}

	@log
	async readTextFile(params: ReadFileParams) {
		const { from, transformOptions, options } = params;

		const { readStreamOptions, writeStream } = options ?? {};

		const _writeStream = writeStream ?? new WritableStream();

		return pipeline(
			createReadStream(from, readStreamOptions),
			this._transform(transformOptions),
			_writeStream,
		);
	}

	@log
	async writeTextFile<TSource extends string | ReadableStream>(
		params: WriteFileParams<TSource>,
	) {
		const { to, source, options, transformOptions } = params;

		const { readableOptions, writeStreamOptions, bufferChunkSize } =
			options ?? {};

		let readable: Readable | ReadableStream;

		if (typeof source === 'string') {
			readable = Readable.from(
				(function* () {
					const chunkSize = (bufferChunkSize || 64) * 1024;

					for (let i = 0; i < source.length; i += chunkSize) {
						yield source.slice(i, i + chunkSize);
					}
				})(),
				readableOptions,
			);
		} else {
			readable = source;
		}

		return pipeline(
			readable,
			this._transform(transformOptions),
			createWriteStream(to, writeStreamOptions),
		);
	}
}
