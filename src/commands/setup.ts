
import { GluegunCommand } from 'gluegun'


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
    toolbox.print.info("\n\n")
    toolbox.print.info("Welcome to the Makerflow CLI!\n")
    toolbox.print.info("\n")
    toolbox.print.info("This is a one-time setup process where you can connect your device to you Makerflow account.\n")
    toolbox.print.info("\n")
    const registrationSpinner = toolbox.print.spin("Waiting for you to finish the registration process...")
        await new Promise(resolve => setTimeout(resolve, 5000))
        registrationSpinner.stop()
    const accountAskResponse = await toolbox.prompt.ask({
        type: 'confirm',
        name: 'accountAsk',
        message: 'Do you have a Makerflow account?',
    })
    if (accountAskResponse.accountAsk) {
        toolbox.print.info("\n")
        toolbox.print.info("Great! Let's get your API token setup on this device.\n")
        toolbox.setupApiToken();
    } else {
        toolbox.print.info("\n")
        toolbox.print.info("No Problem! Registering for an account is super easy and takes 30 seconds!")
        const accountSetupAskResponse = await toolbox.prompt.ask({
            type: 'confirm',
            name: 'accountSetupAsk',
            message: 'Would you like to register for an account now?',
        })
        if (!accountSetupAskResponse.accountSetupAsk) {
            toolbox.print.info("\n")
            toolbox.print.info("OK! You can always redo this process by running 'makerflow setup'.\n")
            return;
        }
        toolbox.print.info("Cool! Opening your browser to https://app.makerflow.co/register...")
        toolbox.system.exec("open https://app.makerflow.co/register")
        const registrationSpinner = toolbox.print.spin("Waiting for you to finish the registration process...")
        await new Promise(resolve => setTimeout(resolve, 5000))
        registrationSpinner.stop()
        const accountSetupFinishedResponse = await toolbox.prompt.ask({
            type: 'confirm',
            name: 'accountSetupFinished',
            message: 'Did you finish creating your Makerflow account?',
        })
        if (!accountSetupFinishedResponse.accountSetupFinished) {
            toolbox.print.info("\n")
            toolbox.print.info("OK! You can always redo this process by running 'makerflow setup'.\n")
            return;
        }
        toolbox.print.info("\n")
        toolbox.print.info("Great! Let's get your API token setup on this device.\n")
        toolbox.setupApiToken();
    }
  },
}

module.exports = command
