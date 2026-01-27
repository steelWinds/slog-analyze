export const FORMATS = {
  BASIC: /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d{3}) (\S+)$/,
  COMBINED: /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d{3}) (\S+) "([^"]*)" "([^"]*)"$/
} as const

export const FIELDS: Record<keyof typeof FORMATS, string[]> = {
  BASIC: ['remoteHost', 'rfc931', 'authUser', 'dateTime', 'request', 'statusCode', 'bytesSent'],
  COMBINED: ['remoteHost', 'rfc931', 'authUser', 'dateTime', 'request', 'statusCode', 'bytesSent', 'referrer', 'userAgent'],
} as const

export const START_WITHOUT_INSTANCE_STRING = 1
