
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'join',
  alias: 'j',
  description: 'Join currently ongoing or the next upcoming event\'s Google Meet',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("===========================================================================")
      toolbox.print.info("Join a currently ongoing event's, or, the next upcoming event's Google Meet")
      toolbox.print.info("===========================================================================\n")
      toolbox.print.info("Opens Google Meet for any");
      toolbox.print.info("1. ongoing event ending in more then one minute");
      toolbox.print.info("2. or, the next event starting in five minutes or less\n")
      toolbox.print.info("If multiple events are available for joining, you will be provided with a prompt to select the one you want to open.\n")
      toolbox.print.info("Parameters:")
      toolbox.print.info("--next - To join only upcoming events")
      toolbox.print.info("--wait - Will wait until the next event has started to open the URL for its Google Meet")
      return;
    }
    toolbox.openCalendarEvent();
  },
}

module.exports = command
