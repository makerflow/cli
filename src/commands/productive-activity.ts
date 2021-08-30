
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'productive-activity',
  hidden: true,
  description: 'Record productive activity. To be used by makerflow plugins of other apps.',
  run: async toolbox => {
    toolbox.recordProductiveActivity();
  },
}

module.exports = command
