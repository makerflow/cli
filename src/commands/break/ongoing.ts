
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'ongoing',
  description: 'Check if you are currently on a break.',
  run: async toolbox => {
    toolbox.ongoingBreak();
  },
}

module.exports = command
