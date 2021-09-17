
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'toggle',
  alias: ["ft", "flow"],
  description: 'Start or end Flow Mode to do deep work by blocking distractions and notifications.',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("================")
      toolbox.print.info("Toggle Flow Mode")
      toolbox.print.info("================")
      toolbox.print.info("Start or end Flow Mode to do deep work by blocking distractions and notifications.")
      toolbox.print.info("\n");
      toolbox.print.info("Parameters")
      toolbox.print.info("----------")
      toolbox.print.info("--kill - Close/reopen chat apps like Slack, Discord, MS Teams, Telegram, Messages, and WhatsApp.")
      toolbox.print.info("         Only apps that were closed on starting Flow Mode are reopened when Flow Mode ends.")
      toolbox.print.info("         See 'config kill' to close distracting apps automatically when Flow Mode starts.")
      return;
    }
    toolbox.toggleFlowMode();
  },
}

module.exports = command
