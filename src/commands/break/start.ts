
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'start',
  description: 'Go on a break. If you have connected Makerflow to Slack, this will update your Slack status.',
  run: async toolbox => {
    toolbox.beginBreak();
  },
}

module.exports = command
