import chalk from 'chalk';
import { consola, type ConsolaInstance } from 'consola';

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

export function log(_: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (import.meta.env.PROD) return;

  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    Logger.start(`Entering method ${propertyKey}`);

    try {
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result
          .then((res) => res)
          .catch((err) => {
            Logger.error(`Error in method ${propertyKey}: ${err instanceof Error ? err.message : String(err)}`);

            throw err;
          })
          .finally(() => Logger.log(`Exiting method ${propertyKey}`));
      }

      Logger.log(`Exiting method ${propertyKey}`);

      return result;
    } catch (err) {
      Logger.error(`Error in method ${propertyKey}: ${err instanceof Error ? err.message : String(err)}`);

      throw err;
    }
  };

  return descriptor;
}
