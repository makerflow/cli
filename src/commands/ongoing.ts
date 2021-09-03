
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'ongoing',
  hidden: true,
  description: 'Check if Flow Mode is currently ongoing',
  run: async toolbox => {
    toolbox.ongoingFlowMode();
  },
}

module.exports = command
