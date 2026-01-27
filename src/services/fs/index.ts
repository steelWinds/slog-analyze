import type {
	AsyncTransformGenerator,
	TransformFileStreamOptions,
	TransformFileStreamParams,
	TransformFunction,
	TransformTextStreamOptions,
} from '@/services/fs/types.ts';
import { ReadStream, createReadStream, createWriteStream } from 'node:fs';
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
			onTransformError,
			...fileStreamOptions
		} = options ?? {};

		return this._transformFileStream({
			from,
			options: fileStreamOptions,
			to,
			transform: async function* _transform(source: ReadStream) {
				source.setEncoding(encoding);

				for await (const chunk of source) {
					try {
						yield await transform(chunk);
					} catch (err) {
						if (onTransformError) {
							onTransformError(chunk, err);
						} else {
							throw err;
						}
					}
				}
			},
		});
	}
}
