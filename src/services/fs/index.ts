import type {
	AsyncTransformGenerator,
	TransformFileStreamOptions,
	TransformFileStreamParams,
	TransformFunction,
	TransformTextStreamOptions,
} from '@/services/fs/types.ts';
import { ReadStream, createReadStream, createWriteStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { log } from '@/utils/logger/index.ts';
import { pipeline } from 'node:stream/promises';

export class FileStreamService {
	@log
	private async _transformFileStream(
		params: TransformFileStreamParams<
			AsyncTransformGenerator,
			TransformFileStreamOptions
		>,
	) {
		const { from, to, transform, options } = params;

		try {
			await pipeline(
				createReadStream(from, options?.read),
				async function* _transform(source: ReadStream) {
					yield* transform(source);
				},
				createWriteStream(to, options?.write),
			);
		} catch (err) {
			if (options?.onError) {
				options?.onError(err);
			} else {
				throw err;
			}
		}
	}

	@log
	async transformTextStream(
		params: TransformFileStreamParams<
			TransformFunction<string, string>,
			TransformTextStreamOptions
		>,
	) {
		const { from, to, transform, options } = params;

		const {
			encoding = 'utf-8',
			readline,
			onTransformError,
			...fileStreamOptions
		} = options ?? {};

		return this._transformFileStream({
			from,
			options: fileStreamOptions,
			to,
			transform: async function* _transform(source: ReadStream) {
				source.setEncoding(encoding);

				let _source;

				if (readline) {
					_source = createInterface({
						crlfDelay: Infinity,
						input: source,
					});
				} else {
					_source = source;
				}

				for await (const line of _source) {
					try {
						yield await transform(line);
					} catch (err) {
						if (onTransformError) {
							onTransformError(line, err);
						} else {
							throw err;
						}
					}
				}
			},
		});
	}
}
