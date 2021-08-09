
import { GluegunCommand } from 'gluegun'
import { setPassword } from 'keytar'


const command: GluegunCommand = {
  name: 'token',
  description: 'Set your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api',
  run: async toolbox => {
    let token = null;
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
