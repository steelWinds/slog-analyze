import type { ReadStream, ReadStreamOptions, WriteStreamOptions } from "fs"

export type AsyncTransformGenerator = (source: ReadStream) => AsyncGenerator<Buffer | string, void, any>

export type TransformFunction<TChunk, TResult> = (chunk: TChunk) => TResult | Promise<TResult>

export type TransformFileStreamOptions = {
  read?: ReadStreamOptions,
  write?: WriteStreamOptions,
  onError?: (err: unknown) => void
}

export type TransformTextStreamOptions = TransformFileStreamOptions & {
  encoding?: BufferEncoding
  onTransformError?: (chunk: Buffer, err: unknown) => void
}
