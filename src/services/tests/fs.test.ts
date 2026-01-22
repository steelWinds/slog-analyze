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
