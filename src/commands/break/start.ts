
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'start',
  alias: 's',
  description: 'Go on a short break. If you have connected Makerflow to Slack, this will update your Slack status.',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("=============================")
      toolbox.print.info("Go on a short break from work")
      toolbox.print.info("=============================\n")
      toolbox.print.info("`makerflow break start` - Start a beak. Sets your Slack status emoji to ⏸\n" +
        "\n" +
        "`makerflow break start --reason=<type>` - Start a break with a specific reason. Supported values for reason are one of `lunch`, `coffee`, `tea`, `beverage`, `walk`, `run`, `workout`, `child`, `doctor`")
      return;
    }
    toolbox.beginBreak();
  },
}

module.exports = command
