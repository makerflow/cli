
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'stop',
  alias: ['e', 'st'],
  description: 'Stop your ongoing break.',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("====================")
      toolbox.print.info("Stop your ongoing break")
      toolbox.print.info("====================")
      toolbox.print.info("Finish your break. Slack status is cleared.")
      return;
    }
    toolbox.stopBreak();
  },
}

module.exports = command
