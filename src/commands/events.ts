
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
    toolbox.print.info("Interact with events from connected Google Calendars. You can your calendars with Makerflow from the \n" +
      "https://app.makerflow.co/integrations page on the website.")
    toolbox.print.info("Run 'makerflow events list --help' or 'makerflow events join --help' for more information")
  },
}

module.exports = command
