import { analyze, analyzeConfig } from '@/cli/commands/analyze/index.ts'
import { Command } from '@commander-js/extra-typings'

export const run = () => {
  const program = new Command()

  program
    .name(import.meta.env.TSDOWN_APP_NAME)
    .description(import.meta.env.TSDOWN_APP_DESCRIPTION)
    .version(import.meta.env.TSDOWN_APP_VERSION)

  program
    .command(analyzeConfig.name)
    .description(analyzeConfig.description)
    .arguments(analyzeConfig.arguments)
    .action((path) => { analyze(path) })

  program.parse()
}
