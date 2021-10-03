
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'events',
  alias: ["e", "event", "meetings", "meeting"],
  hidden: true,
  description: 'Interact with events from connected Google Calendars',
  run: async toolbox => {
    toolbox.print.info("======")
    toolbox.print.info("Events")
    toolbox.print.info("======\n")
    toolbox.print.info("Interact with events from connected Google Calendars. You can connect your calendars with Makerflow from \n" +
      "https://app.makerflow.co/integrations\n")
    toolbox.print.info("Run 'makerflow events list --help' or 'makerflow events join --help' for more information.\n")
    toolbox.print.info("Commands");
    toolbox.print.info("--------")
    toolbox.print.info("`makerflow events list` - will list recently ended, ongoing and upcoming events from Google Calendar.");
    toolbox.print.info("`makerflow events join` - will open a currently ongoing event's, or, the next upcoming event's Google Meet.");
    toolbox.print.info("`makerflow events join --next --wait` - Open next event's Google Meet when the event starts.");
    toolbox.print.info("\nAliases: e, event, meetings, meeting")
  },
}

module.exports = command
