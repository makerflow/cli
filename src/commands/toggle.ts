
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'toggle',
  description: 'Start or end Flow Mode to do deep work by blocking distractions and notifications.',
  run: async toolbox => {
    toolbox.toggleFlowMode();
  },
}

module.exports = command
