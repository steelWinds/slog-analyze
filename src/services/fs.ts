import { pipeline } from 'node:stream/promises'
import { createReadStream, createWriteStream, type ReadStreamOptions, type WriteStreamOptions } from 'node:fs'
import type { AsyncTransformGenerator, TransformFunction } from '@/services/types.ts'

type TransformFileStreamOptions = { read?: ReadStreamOptions, write?: WriteStreamOptions }
type TransformTextStreamOptions = TransformFileStreamOptions & { encoding?: BufferEncoding }

export class FileStreamService {
  async #transformFileStream(from: string, transform: AsyncTransformGenerator, to: string, options?: TransformFileStreamOptions) {
    await pipeline(
      createReadStream(from, options?.read),
      async function* (source) {
        yield* transform(source)
      },
      createWriteStream(to, options?.write)
    )
  }

  async transformTextStream(from: string, transform: TransformFunction<string, string>, to: string, options?: TransformTextStreamOptions) {
    const { encoding = 'utf-8', ...fileStreamOptions } = options ?? {}

    return this.#transformFileStream(
      from,
      async function* (source) {
        source.setEncoding(encoding)

        for await (const chunk of source) {
          yield transform(chunk as string)
        }
      },
      to,
      fileStreamOptions
    )
  }
}
