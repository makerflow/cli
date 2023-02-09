
import { GluegunCommand, GluegunToolbox } from 'gluegun'


const command: GluegunCommand = {
  name: 'start',
  hidden: true,
  description: 'Start Flow Mode to do deep work by blocking distractions and notifications.',
  run: async (toolbox: GluegunToolbox) => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("================")
      toolbox.print.info("Start Flow Mode")
      toolbox.print.info("================")
      toolbox.print.info("Start Flow Mode to do deep work by blocking distractions and notifications.")
      toolbox.print.info("\n");
      toolbox.print.info("Parameters")
      toolbox.print.info("----------")
      toolbox.print.info("--kill        - Close/reopen chat apps like Slack, Discord, MS Teams, Telegram, Messages, and WhatsApp.")
      toolbox.print.info("                Only apps that were closed on starting Flow Mode are reopened when Flow Mode ends.")
      toolbox.print.info("                See 'config kill' to close distracting apps automatically when Flow Mode starts.")
      toolbox.print.info("--duration    - Specify how long you want Flow Mode to run for. This will override the default duration set with 'config default-duration'.")
      toolbox.print.info("--no-duration - Do not set a duration for Flow Mode if you have a default duration set with 'config default-duration'.")
      return;
    }
    toolbox.beginFlowMode();
  },
}

module.exports = command
