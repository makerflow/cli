
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'todo',
  description: 'Get a list of pending tasks from other apps like messages in Slack or pull requests in GitHub/Bitbucket. See the "tasks done" subcommand to mark them as done',
  run: async toolbox => {
    toolbox.getTasksTodo();
  },
}

module.exports = command
