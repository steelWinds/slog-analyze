import { expect, test, vi } from 'vitest'
import { Logger } from '@/utils/logger/index.ts'
import { consola } from 'consola';
import { faker } from '@faker-js/faker/locale/en';

vi.mock(import('consola'))

test('Prompt output', async () => {
  const msg = faker.lorem.words(1)

  const spy = vi.spyOn(consola, 'prompt').mockReturnValue(new Promise(resolve => resolve(msg)))

  await expect(Logger.prompt(msg)).resolves.toEqual(msg)

  spy.mockReset()
})
