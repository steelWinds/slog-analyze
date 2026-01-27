import type { ReadStream, ReadStreamOptions, WriteStreamOptions } from "fs"

export type AsyncTransformGenerator = (source: ReadStream) => AsyncGenerator<Buffer | string, void, any>

export type TransformFunction<TChunk, TResult> = (chunk: TChunk) => TResult | Promise<TResult>

export interface TransformFileStreamOptions {
  read?: ReadStreamOptions,
  write?: WriteStreamOptions,
  onError?: (err: unknown) => void
}

export interface TransformTextStreamOptions extends TransformFileStreamOptions {
  encoding?: BufferEncoding
  onTransformError?: (chunk: Buffer, err: unknown) => void
}

export interface TransformFileStreamParams<TTransform, TOptions> {
  from: string
  to: string,
  transform: TTransform,
  options?: TOptions
}
