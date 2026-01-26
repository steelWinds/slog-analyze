import { pipeline } from 'node:stream/promises'
import { createReadStream, createWriteStream, ReadStream } from 'node:fs'
import { log } from '@/utils/logger/index.ts'
import type { AsyncTransformGenerator, TransformFileStreamOptions, TransformFunction, TransformTextStreamOptions } from '@/services/fs/types.ts'

export class FileStreamService {
  @log
  private async _transformFileStream(from: string, transform: AsyncTransformGenerator, to: string, options?: TransformFileStreamOptions) {
    try {
      await pipeline(
        createReadStream(from, options?.read),
        async function* (source: ReadStream) { yield* transform(source) },
        createWriteStream(to, options?.write)
      )
    } catch(err) {
      if (options?.onError) {
        options?.onError(err)
      } else {
        throw err
      }
    }
  }

  @log
  async transformTextStream(from: string, transform: TransformFunction<Buffer, Buffer | string>, to: string, options?: TransformTextStreamOptions) {
    const { encoding = 'utf-8', onTransformError, ...fileStreamOptions } = options ?? {}

    return this._transformFileStream(
      from,
      async function* (source) {
        for await (const chunk of source) {
          try {
            yield await transform(chunk)
          } catch(err) {
            if (onTransformError) onTransformError(chunk, err)
            else throw err
          }
        }
      },
      to,
      fileStreamOptions
    )
  }
}
