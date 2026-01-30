import type { ReadStreamOptions, WriteStreamOptions } from 'node:fs';
import type { ReadableOptions } from 'node:stream';

export type Chunk = Buffer | string;

export type TransformFunction = (
	chunk: Buffer,
) => Promise<Chunk | void> | Chunk | void;

export interface TransformStreamParams {
	callback?: TransformFunction;
	encoding?: BufferEncoding;
	readline?: boolean;
	onTransformError?: (chunk: Buffer, err: unknown) => void;
}

export interface ReadFileParams {
	from: string;
	options?: {
		readStreamOptions?: ReadStreamOptions;
		writeStream?: WritableStream;
	};
	transformOptions?: TransformStreamParams;
}

export interface WriteFileParams<TSource extends string | ReadableStream> {
	to: string;
	source: TSource;
	options?: {
		bufferEncoding?: BufferEncoding;
		bufferChunkSize?: TSource extends ReadableStream ? number : never;
		readableOptions?: TSource extends ReadableStream ? ReadableOptions : never;
		writeStreamOptions?: WriteStreamOptions;
	};
	transformOptions?: TransformStreamParams;
}
