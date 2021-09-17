
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'break',
  alias: ["b", "breaks"],
  commandPath: ["break"],
  hidden: true,
  description: 'Start or stop breaks',
  run: async toolbox => {
    toolbox.print.info("======")
    toolbox.print.info("Breaks")
    toolbox.print.info("======")
    toolbox.print.info("`break` commands are a quick way to set your Slack status and let your coworkers know when you are " +
      "away on a break.\n")
    toolbox.print.info("For more information run 'makerflow break start --help' or 'makerflow break stop --help' for more information");
  },
}

module.exports = command
