import { faker } from '@faker-js/faker/locale/en';
import { beforeEach, expect, test, vi } from 'vitest'
import { fs, vol } from 'memfs'
import { format } from 'path';
import { FileStreamService } from '@/services/fs.ts';

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
})

test('Test transform file stream', async () => {
  const msg = faker.lorem.text()

  const pathInputFile = format({
    root: '/',
    base: faker.system.commonFileName('txt')
  })
  const pathOutputFile = format({
    root: '/',
    base: faker.system.commonFileName('txt')
  })

  const highWaterMark = Math.round(msg.length / 4)

  fs.writeFileSync(pathInputFile, msg)

  const fsService = new FileStreamService()

  await fsService.transformTextStream(
    pathInputFile,
    (chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(highWaterMark)

      return chunk
    },
    pathOutputFile,
    {
      encoding: 'utf-8',
      read: {
        highWaterMark
      },
      write: {
        highWaterMark
      }
    }
  )

  const text = fs.readFileSync(pathOutputFile, 'utf-8')

  expect(text).toBe(msg)
})

test('Test error suppression in transform callback', async () => {
  const msg = faker.lorem.text()
  const pathInputFile = format({
    root: '/',
    base: faker.system.commonFileName('txt')
  })
  const pathOutputFile = format({
    root: '/',
    base: faker.system.commonFileName('txt')
  })

  fs.writeFileSync(pathInputFile, msg)

  const fsService = new FileStreamService()

  const err = new Error('Transform error')
  const transformCallback = vi.fn(() => {
    throw err
  })
  const onTransformError = vi.fn()

  await fsService.transformTextStream(
    pathInputFile,
    transformCallback,
    pathOutputFile,
    { onTransformError }
  )

  expect(onTransformError.mock.calls[0][1]).toBeInstanceOf(Error)
  expect(onTransformError.mock.calls[0][1].message).toBe('Transform error')
})

test('Test error thrown in transform callback', async () => {
  const msg = faker.lorem.text()

  const pathInputFile = format({
    root: '/',
    base: faker.system.commonFileName('txt')
  })
  const pathOutputFile = format({
    root: '/',
    base: faker.system.commonFileName('txt')
  })

  fs.writeFileSync(pathInputFile, msg)

  const fsService = new FileStreamService()
  const transformCallback = vi.fn(() => {
    throw new Error('Transform error')
  })

  await expect(
    fsService.transformTextStream(
      pathInputFile,
      transformCallback,
      pathOutputFile,
    )
  ).rejects.toThrow('Transform error')
})
