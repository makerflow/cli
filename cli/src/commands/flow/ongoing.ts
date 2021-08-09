
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'ongoing',
  description: 'Check if a flow mode is currently ongoing',
  run: async toolbox => {
    toolbox.ongoingFlowMode();
  },
}

module.exports = command
