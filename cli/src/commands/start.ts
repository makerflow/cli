
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'start',
  description: 'Start Flow Mode to do deep work by blocking distractions and notifications.',
  run: async toolbox => {
    toolbox.beginFlowMode();
  },
}

module.exports = command
