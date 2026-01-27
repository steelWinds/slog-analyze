import { type ConsolaInstance, consola } from 'consola';
import chalk from 'chalk';

export class Logger {
  static log(msg: string) {
    consola.info(chalk.cyan(msg))
  }

  static start(msg: string) {
    consola.start(chalk.magenta(msg))
  }

  static warn(msg: string) {
    consola.warn(chalk.yellow(msg))
  }

  static success(msg: string) {
    consola.success(chalk.green(msg))
  }

  static error(msg: string) {
    consola.error(chalk.red(msg))
  }

  static prompt(...args: Parameters<ConsolaInstance['prompt']>) {
    return consola.prompt(...args)
  }
}

export const log = (_target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  if (import.meta.env.TSDOWN_MODE === 'production') {
    return
  }

  const originalMethod = descriptor.value;

  descriptor.value = function  value(...args: any[]) {
    Logger.start(`Entering method ${propertyKey}`);

    try {
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result
          .then((res) => res)
          .catch((err) => {
            Logger.error(`Error in method ${propertyKey}: ${err.message}`);

            throw err;
          })
          .finally(() => Logger.log(`Exiting method ${propertyKey}`));
      }

      Logger.log(`Exiting method ${propertyKey}`);

      return result;
    } catch (err: any) {
      Logger.error(`Error in method ${propertyKey}: ${err.message}`);

      throw err;
    }
  };

  return descriptor;
}
