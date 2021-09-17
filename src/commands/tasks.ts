
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'tasks',
  alias: ["t", "task"],
  hidden: true,
  description: 'See pending tasks or mark them as done',
  run: async toolbox => {
    toolbox.print.info("======")
    toolbox.print.info("Tasks")
    toolbox.print.info("======\n")
    toolbox.print.info("Tasks show up in Makerflow by connecting with your other collaboration tools like Slack, GitHub " +
      "or Bitbucket.")
    toolbox.print.info("You can connect these tools with Makerflow from the https://app.makerflow.co/integrations page on the website.\n");
    toolbox.print.info("Run 'makerflow tasks todo --help' or 'makerflow tasks done --help' for more information")
  },
}

module.exports = command
