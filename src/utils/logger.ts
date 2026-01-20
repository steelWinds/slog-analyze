import chalk from 'chalk';
import { consola, type ConsolaInstance } from 'consola';

export class Logger {
    log(msg: string) {
        consola.info(chalk.cyan(msg))
    }

    start(msg: string) {
        consola.start(chalk.magenta(msg))
    }

    warn(msg: string) {
        consola.warn(chalk.yellow(msg))
    }

    success(msg: string) {
        consola.success(chalk.green(msg))
    }

    error(msg: string) {
        consola.error(chalk.red(msg))
    }

    prompt(...args: Parameters<ConsolaInstance['prompt']>) {
        return consola.prompt(...args)
    }
}