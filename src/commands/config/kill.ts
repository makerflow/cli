import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'kill',
  description: 'Configure whether any apps you have open should be closed when Flow Mode is started and reopened when Flow Mode is stopped.',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("======================")
      toolbox.print.info("Configure app closing")
      toolbox.print.info("======================")
      toolbox.print.info("Configure whether any apps you have open should be closed when Flow Mode is started and reopened when Flow Mode is stopped.")
      toolbox.print.info("Run this command (makerflow config kill) and follow the prompts on your screen to complete setup.")
      return;
    }
    toolbox.configureAppKilling()
  },
}

module.exports = command
