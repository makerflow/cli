
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'stop',
  description: 'Stop your ongoing break.',
  run: async toolbox => {
    toolbox.stopBreak();
  },
}

module.exports = command
