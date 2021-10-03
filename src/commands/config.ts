
import { GluegunCommand } from 'gluegun'


const command: GluegunCommand = {
  name: 'config',
  alias: ["c", "configuration", "configure", "settings", "pref", "preferences"],
  hidden: true,
  description: 'Setup makerflow for your device',
  run: async toolbox => {
    toolbox.print.info("======")
    toolbox.print.info("Config")
    toolbox.print.info("======\n")
    toolbox.print.info("Run 'makerflow config token --help' or 'makerflow config kill --help' for more information")
  },
}

module.exports = command
