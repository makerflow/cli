
import { GluegunCommand } from 'gluegun'
import { getPassword } from 'keytar'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'


async function checkIfPasswordExists(config) {
  let passwordExists = false
  if (config.hasOwnProperty('credentialsSetup') && config.credentialsSetup) {
    const pwd = await getPassword('makerflow', 'default')
    passwordExists = pwd !== null && pwd.trim().length > 5
  }
  return passwordExists
}

function printRedoAvailableMessage(toolbox: Toolbox) {
  toolbox.print.info('\n')
  toolbox.print.info('OK! You can always redo this process by running \'makerflow setup\'.\n')
}

async function setupApiToken(toolbox: Toolbox) {
  const accountAskResponse = await toolbox.prompt.ask({
    type: 'confirm',
    name: 'accountAsk',
    message: 'Do you already have a Makerflow account?\nYou would have one if you created it on https://app.makerflow.co'
  })
  if (accountAskResponse.accountAsk) {
    toolbox.print.info('\n')
    toolbox.print.info('Great! Let\'s get your API token setup on this device.\n')
    await toolbox.setupApiToken()
    return true
  } else {
    toolbox.print.info('\n')
    toolbox.print.info('No Problem! Registering for an account is super easy and takes 30 seconds!')
    const accountSetupAskResponse = await toolbox.prompt.ask({
      type: 'confirm',
      name: 'accountSetupAsk',
      message: 'Would you like to register for an account now?',
      initial: true
    })
    if (!accountSetupAskResponse.accountSetupAsk) {
      printRedoAvailableMessage(toolbox)
      return false
    }
    toolbox.print.info('Cool! Opening your browser to https://app.makerflow.co/register...')
    await toolbox.system.exec('open https://app.makerflow.co/register')
    const registrationSpinner = toolbox.print.spin('Waiting for you to finish the registration process...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    registrationSpinner.stop()
    const accountSetupFinishedResponse = await toolbox.prompt.ask({
      type: 'confirm',
      name: 'accountSetupFinished',
      message: 'Did you finish creating your Makerflow account?'
    })
    if (!accountSetupFinishedResponse.accountSetupFinished) {
      printRedoAvailableMessage(toolbox)
      return false
    }
    toolbox.print.info('\n')
    toolbox.print.info('Great! Let\'s get your API token setup on this device.\n')
    await toolbox.setupApiToken()
    return true
  }
}

async function shouldUseExistingConfig(toolbox: Toolbox) {
  const existingConfigCheck = toolbox.print.spin('Checking for existing configuration...')
  let config = toolbox.mfConfig()
  let passwordExists = await checkIfPasswordExists(config)
  if (passwordExists || (config.hasOwnProperty('onboarding') && config.onboarding.hasOwnProperty('apiSetupComplete') && config.onboarding.apiSetupComplete)) {
    existingConfigCheck.succeed('Looks like you have previously used Makerflow. Welcome back!')
    const useExistingConfig = await toolbox.prompt.ask({
      type: 'confirm',
      name: 'confirm',
      message: 'Would you like to continue using your previous configuration?',
      initial: true
    })
    if (useExistingConfig.confirm && passwordExists) {
      toolbox.print.success('Perfect, you are all setup! Run `makerflow --help` if you need any information')
      return true
    } else if (useExistingConfig.confirm) {
      toolbox.print.info('Makerflow CLI needs an API token from your Makerflow account to work.')
      toolbox.print.info('Let\'s get your API token setup on this device.\n')
      await toolbox.setupApiToken()
      return true
    } else {
      toolbox.print.info('OK! Let\'s get you setup once again!')
      return false
    }
  }
  return false
}

const command: GluegunCommand = {
  name: 'setup',
  alias: ["lfg", "🚀"],
  hidden: true,
  description: 'Post-installation setup for Makerflow',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
        toolbox.print.info("===================")
        toolbox.print.info("Setup Makerflow CLI")
        toolbox.print.info("===================")
        toolbox.print.info("Welcome to Makerflow CLI! Setup your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api")
        toolbox.print.info("Run this command (makerflow setup) and follow the prompts on your screen.")
        return;
    }
    toolbox.print.fancy("______  ___        ______                ______________                  \r\n___   |\/  \/______ ____  \/_______ ___________  __\/___  \/______ ___      __\r\n__  \/|_\/ \/ _  __ `\/__  \/\/_\/_  _ \\__  ___\/__  \/_  __  \/ _  __ \\__ | \/| \/ \/\r\n_  \/  \/ \/  \/ \/_\/ \/ _  ,<   \/  __\/_  \/    _  __\/  _  \/  \/ \/_\/ \/__ |\/ |\/ \/ \r\n\/_\/  \/_\/   \\__,_\/  \/_\/|_|  \\___\/ \/_\/     \/_\/     \/_\/   \\____\/ ____\/|__\/  \r\n                                                                         \r\n")
    toolbox.print.info("Welcome to the Makerflow CLI!\n")

    // Check if they have used the Makerflow CLI and have existing configuration we can reuse
    const useExistingConfig = await shouldUseExistingConfig(toolbox)
    if (useExistingConfig) return // Exit command if we are going to reuse

    // Otherwise, continue with onboarding process
    toolbox.print.info("This is a one-time setup process to connect your device with your Makerflow account and setup basic preferences.")
    toolbox.print.info("You should be done in 2 minutes.")
    toolbox.print.info("\n")

    toolbox.print.info("First, we setup the API token")
    const apiTokenSetupDone = await setupApiToken(toolbox)
    if (!apiTokenSetupDone) return // Without a valid API token we are nothing

    toolbox.print.info("\nNext, let's get some basic preferences setup for you.")
    await toolbox.configureAppKilling()

    await toolbox.setupDefaultDuration()

    toolbox.print.success("Perfect, you are all setup! Run `makerflow --help` if you need any information")
  },
}

module.exports = command
