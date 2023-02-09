
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'config',
  alias: ["c", "configuration", "configure", "settings", "pref", "preferences"],
  hidden: true,
  description: 'Setup makerflow for your device',
  run: async toolbox => {
    toolbox.print.info('=============')
    toolbox.print.info('Configuration')
    toolbox.print.info('=============')
    toolbox.print.info(
      'Configure Makerflow CLI with your preferences and account'
    )
    toolbox.print.info('\n')
    toolbox.print.info('Commands')
    toolbox.print.info('--------')
    toolbox.print.info(
      'config token            - Set your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api. Run this command and follow the prompts on your screen.'
    )
    toolbox.print.info(
      'config kill             - Configure whether any chat apps like Slack/Discord/MS Teams/Telegram/Messages/WhatsApp you have open should be closed when Flow Mode is started and reopened when Flow Mode is stopped. Run this command and follow the prompts on your screen to complete setup.'
    )
    toolbox.print.info(
      "config default-duration - Configure how long you want your usual Flow Modes to run for a pomodoro like timed experience."
    )
    toolbox.print.info('\n')
    toolbox.print.info("Run 'makerflow config token --help', 'makerflow config kill --help', 'makerflow config default-duration --help' for more information")
  },
}

module.exports = command
