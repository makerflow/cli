
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'todo',
  description: 'Get a list of pending tasks from other apps like messages in Slack or pull requests in GitHub/Bitbucket. See the "tasks done" subcommand to mark them as done',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("==================")
      toolbox.print.info("See pending tasks")
      toolbox.print.info("==================")
      toolbox.print.info("See a list of pending tasks like messages in Slack or pull requests from GitHub/Bitbucket.")
      toolbox.print.info("Try 'makerflow tasks done' if you also want to mark them as done.")
      return;
    }
    toolbox.getTasksTodo();
  },
}

module.exports = command
