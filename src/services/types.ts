import type { ReadStream } from "fs"

export type AsyncTransformGenerator = (source: ReadStream) => AsyncGenerator<string, void, any>
export type TransformFunction<TChunk, TResult> = (chunk: TChunk) => TResult
