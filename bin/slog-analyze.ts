#!/usr/bin/env node

import { Logger } from '../src/utils/logger.ts'

const logger = new Logger()

const text = 'Hello world, Kirill Shurov!'

logger.log(text)
logger.start(text)
logger.warn(text)
logger.success(text)
logger.error(text)

