import { expect, test, vi } from 'vitest'
import { Logger } from '@/utils/logger.ts'
import { consola } from 'consola';
import { faker } from '@faker-js/faker/locale/en';

vi.mock(import('consola'))

test('Prompt output', async () => {
  const logger = new Logger()

  const msg = faker.lorem.words(1)

  const spy = vi.spyOn(consola, 'prompt').mockReturnValue(new Promise(resolve => resolve(msg)))

  await expect(logger.prompt(msg)).resolves.toEqual(msg)

  spy.mockReset()
})
