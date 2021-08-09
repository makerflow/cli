
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'stop',
  alias: ['stop', 'd'],
  description: 'Stop Flow Mode. This will enable notifications and stop distraction blocking.',
  run: async toolbox => {
    toolbox.endFlowMode();
  },
}

module.exports = command
