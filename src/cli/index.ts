import { Command } from '@commander-js/extra-typings'
import { analyze, analyzeConfig } from '@/cli/commands/analyze/index.ts'

export function run() {
  const program = new Command()

  program
    .name(import.meta.env.VITE_APP_NAME)
    .description(import.meta.env.VITE_APP_DESCRIPTION)
    .version(import.meta.env.VITE_APP_VERSION)

  program
    .command(analyzeConfig.name)
    .description(analyzeConfig.description)
    .arguments(analyzeConfig.arguments)
    .action((path) => analyze(path))

  program.parse()
}
