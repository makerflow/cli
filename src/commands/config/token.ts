
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
    if (toolbox.parameters.options.hasOwnProperty("check") && toolbox.parameters.options.check) {
      const pwd = await getPassword('makerflow', 'default')
      let passwordExists = pwd !== null && pwd.trim().length > 5
      toolbox.print.success(passwordExists)
      return;
    }
    if (toolbox.parameters.options.hasOwnProperty("delete") && toolbox.parameters.options.delete) {
      const spinner = toolbox.print.spin('Deleting token...')
      await deletePassword('makerflow', 'default')
      spinner.succeed('Token deleted')
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
      spinner.succeed('Token saved')
    }
  },
}

module.exports = command
