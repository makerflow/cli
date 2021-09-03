
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'list',
  description: 'See ongoing and upcoming events from Google Calendar for the next three hours',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("====================")
      toolbox.print.info("List calendar events")
      toolbox.print.info("====================")
      toolbox.print.info("See ongoing and upcoming events from Google Calendar for the next three hours")
      return;
    }
    toolbox.getCalendarEvents();
  },
}

module.exports = command
