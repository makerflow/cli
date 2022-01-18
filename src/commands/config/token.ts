
import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'token',
  description: 'Set your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("==================")
      toolbox.print.info("Set your API token")
      toolbox.print.info("==================")
      toolbox.print.info("Set your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api")
      toolbox.print.info("Run this command (makerflow config token) and follow the prompts on your screen.")
      return;
    }
    toolbox.setupApiToken();
  },
}

module.exports = command
