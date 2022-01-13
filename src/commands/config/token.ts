
import { GluegunCommand } from 'gluegun'
import { setPassword, getPassword, deletePassword } from 'keytar'


const command: GluegunCommand = {
  name: 'token',
  description: 'Set your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("==================")
      toolbox.print.info("Set your API token")
      toolbox.print.info("==================")
      toolbox.print.info("Set your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api")
      toolbox.print.info("Run this command (makerflow config token) and follow the prompts on your screen.")
      return;
    }
    let token = null;
    let config = toolbox.mfConfig();
    if (toolbox.parameters.options.hasOwnProperty("check") && toolbox.parameters.options.check) {
      let passwordExists = false;
      if (config.hasOwnProperty("credentialsSetup") && config.credentialsSetup) {
        const pwd = await getPassword('makerflow', 'default')
        passwordExists = pwd !== null && pwd.trim().length > 5
      }
      toolbox.print.success(passwordExists)
      return;
    }
    if (toolbox.parameters.options.hasOwnProperty("delete") && toolbox.parameters.options.delete) {
      if (config.hasOwnProperty("credentialsSetup") && config.credentialsSetup) {
        const spinner = toolbox.print.spin('Deleting token...')
        await deletePassword('makerflow', 'default')
        spinner.succeed('Token deleted')
      } else {
        toolbox.print.error("No token to delete.")
      }
      return;
    }
    if (toolbox.parameters.options.hasOwnProperty("value") && toolbox.parameters.options.value) {
      token = toolbox.parameters.options.value;
    }
    if (token === null) {
      const response = await toolbox.prompt.ask([{
        type: 'password',
        name: 'token',
        message: 'Enter your API Token. You can get a new token from https://app.makerflow.co/settings#api'
      }])
      token = response.token
    }
    if (token) {
      const spinner = toolbox.print.spin('Saving token...')
      await setPassword('makerflow', 'default', token)
      toolbox.updateMfConfig('credentialsSetup', true)
      spinner.succeed('Token saved')
    }
  },
}

module.exports = command
