
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'join',
  description: 'Join currently ongoing or the next upcoming event\'s Google Meet',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("===========================================================================")
      toolbox.print.info("Join a currently ongoing event's, or, the next upcoming event's Google Meet")
      toolbox.print.info("===========================================================================\n")
      toolbox.print.info("Opens Google Meet for any");
      toolbox.print.info("1. currently ongoing event ending in more then one minute");
      toolbox.print.info("2. or, the next event starting in five minutes or less\n")
      toolbox.print.info("If multiple candidate events are available for joining, URLs to meetings are provided so you can open them manually.")
      return;
    }
    toolbox.openCalendarEvent();
  },
}

module.exports = command
