import { test, expect } from 'vitest'
import { parseCLFLine } from '@/utils/parseCLFLine/index.ts'
import { faker } from '@faker-js/faker/locale/en';

test('Parse valid CLF Lines', async () => {
  const logLineCombined = '127.0.0.1 - - [23/Jan/2026:15:30:45 +0300] "GET /index.html HTTP/1.1" 200 1234 "https://example.com/" "Mozilla/5.0..."';
  const logLineBasic = '127.0.0.1 - - [23/Jan/2026:15:30:45 +0300] "GET /index.html HTTP/1.1" 200 1234';

  expect(parseCLFLine(logLineBasic)).toStrictEqual({
    remoteHost: '127.0.0.1',
    rfc931: '-',
    authUser: '-',
    dateTime: '23/Jan/2026:15:30:45 +0300',
    request: 'GET /index.html HTTP/1.1',
    statusCode: '200',
    bytesSent: '1234'
  })

  expect(parseCLFLine(logLineCombined)).toStrictEqual({
    remoteHost: '127.0.0.1',
    rfc931: '-',
    authUser: '-',
    dateTime: '23/Jan/2026:15:30:45 +0300',
    request: 'GET /index.html HTTP/1.1',
    statusCode: '200',
    bytesSent: '1234',
    referrer: 'https://example.com/',
    userAgent: 'Mozilla/5.0...'
  })
})

test('Parse invalid string', () => {
  const invalidLogLine = faker.lorem.words(10);

  expect(parseCLFLine(invalidLogLine)).toBe(null)
})
