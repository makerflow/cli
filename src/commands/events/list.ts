
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'list',
  description: 'See upcoming events from Google Calendar',
  run: async toolbox => {
    toolbox.getCalendarEvents();
  },
}

module.exports = command
