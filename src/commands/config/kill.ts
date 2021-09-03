import { GluegunCommand } from 'gluegun'

const supportedApps = ["Slack", "Discord", "WhatsApp", "Telegram", "Microsoft Teams"]
const command: GluegunCommand = {
  name: 'kill',
  description: 'Configure whether any apps you have open should be closed when Flow Mode is started and reopened when Flow Mode is stopped.',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("======================")
      toolbox.print.info("Configure app closing")
      toolbox.print.info("======================")
      toolbox.print.info("Configure whether any apps you have open should be closed when Flow Mode is started and reopened when Flow Mode is stopped.")
      toolbox.print.info("Run this command (makerflow config kill) and follow the prompts on your screen to complete setup.")
      return;
    }
    const {
      mfConfig,
      print: { success },
      updateMfConfig,
      prompt
    } = toolbox
    let config = mfConfig()
    let alwaysKill = config.alwaysKill;
    const choices = supportedApps.filter(app => {
      return toolbox.filesystem.exists(`/Applications/${app}.app`);
    });
    const result = await prompt.ask([
      {
        type: 'confirm',
        name: 'alwaysKill',
        message: "Would you like to always close some apps you define when Flow Mode is started and reopen them when Flow Mode is stopped?",
        initial: alwaysKill
      },
      {
        type: 'multiselect',
        name: 'appsToKill',
        choices: choices,
        message: "Which of these apps would you like to close?  (select with spacebar, confirm with enter)",
      }
    ])
    updateMfConfig('alwaysKill', result['alwaysKill'])
    updateMfConfig('appsToKill', result['appsToKill'])
    config = mfConfig()
    if (config.alwaysKill && config.appsToKill.length > 0) {
      success("Following apps will always be closed when Flow Mode has started, and reopened when it ends: " + config.appsToKill.join(", "))
    } else {
      success("No apps will be closed automatically when Flow Mode has started, and reopened when it ends.")
    }
  },
}

module.exports = command
