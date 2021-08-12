import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'kill',
  description: 'Configure whether any apps you have open should be closed when Flow Mode is started and reopened when Flow Mode is stopped.',
  run: async toolbox => {
    const {
      mfConfig,
      print: { success },
      updateMfConfig,
      prompt
    } = toolbox
    let config = mfConfig()
    let alwaysKill = config.alwaysKill;
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
        choices: ["Slack", "Discord", "WhatsApp"],
        message: "Which of these apps would you like to close?"
      }
    ])
    updateMfConfig('alwaysKill', result['alwaysKill'])
    updateMfConfig('appsToKill', result['appsToKill'])
    config = mfConfig()
    if (config.alwaysKill) {
      success("Following apps will always be closed when Flow Mode has started, and reopened when it ends: " + config.appsToKill.join(", "))
    } else {
      success("No apps will be closed automatically when Flow Mode has started")
    }
  },
}

module.exports = command
