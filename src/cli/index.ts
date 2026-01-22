import { Command } from 'commander'

export function run() {
  const commander = new Command()

  commander
    .name(import.meta.env.VITE_APP_NAME)
    .description(import.meta.env.VITE_APP_DESCRIPTION)
    .version(import.meta.env.VITE_APP_VERSION)

  commander.parse()
}
