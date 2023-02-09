const { build } = require('gluegun')

/**
 * Create the cli and kick it off
 */
async function run(argv) {
  // create a CLI runtime
  const cli = build()
    .brand('makerflow')
    .src(__dirname)
    .defaultCommand(toolbox =>
      toolbox.print.info("Run 'makerflow --help' for more information")
    )
    .help(toolbox => {
      toolbox.print.info('Makerflow CLI 💻 🌊')
      toolbox.print.info('===================')
      toolbox.print.info(
        'Makerflow is a deep work  and collaboration assistant for developers. Get in the zone without ' +
          'hiding away from your product manager, designer or other developers on the team!'
      )
      toolbox.print.info('\n')
      toolbox.print.info(
        'Run any command with the --help flag to get more usage details about it.'
      )
      toolbox.print.info(
        "For example, run 'makerflow toggle --help' to get usage information about the 'toggle' command"
      )
      toolbox.print.info('\n')
      toolbox.print.info('=========')
      toolbox.print.info('Flow Mode')
      toolbox.print.info('=========')
      toolbox.print.info(
        'Start or end Flow Mode to do deep work by blocking distractions and notifications.'
      )
      toolbox.print.info(`
Starting Flow Mode will: 
1. 🔕 Turn on "do-not-disturb" mode on macOS to block your notifications and prevent distractions.
2. 💬 If you have your Slack workspace connected to Makerflow, it will automatically set your Slack status to let your teammates know you might be slow to respond.
3. 🙅 Close distracting chat apps like Slack, Discord, MS Teams, Telegram, WhatsApp, and Messages
4. 🛑 Block distracting websites if you have Makerflow Chrome or Firefox extensions installed.

Stopping Flow Mode will reverse all the above actions.`)
      toolbox.print.info('\n')
      toolbox.print.info('Commands')
      toolbox.print.info('--------')
      toolbox.print.info(
        'toggle        - Start or end Flow Mode to do deep work by blocking distractions and notifications.'
      )
      toolbox.print.info(
        "                See 'config kill' to close distracting apps automatically when Flow Mode starts."
      )
      toolbox.print.info(
        'toggle --kill - Toggle Flow Mode *AND* close/reopen chat apps like Slack, Discord, MS Teams, Telegram, Messages, and WhatsApp.'
      )
      toolbox.print.info(
        '                Only apps that were closed on starting Flow Mode are reopened when Flow Mode ends.'
      )
      toolbox.print.info(
        "                See 'config kill' to close distracting apps automatically when Flow Mode starts."
      )

      toolbox.print.info('\n')
      toolbox.print.info('=====')
      toolbox.print.info('Tasks')
      toolbox.print.info('=====')
      toolbox.print.info(
        'Tasks show up in Makerflow by connecting with your other collaboration tools like Slack, GitHub or Bitbucket.'
      )
      toolbox.print.info(
        'You can connect these tools with Makerflow from the "Setup Integrations" (https://app.makerflow.co/integrations) page on the website'
      )
      toolbox.print.info('Commands')
      toolbox.print.info('--------')
      toolbox.print.info(
        'tasks todo - See a list of pending tasks like messages in Slack or pull requests from GitHub/Bitbucket.'
      )
      toolbox.print.info(
        'tasks done - See a list of pending tasks like messages in Slack or pull requests from GitHub/Bitbucket.'
      )
      toolbox.print.info(
        '             Select one or more tasks with spacebar and hit enter to mark them as done.'
      )
      toolbox.print.info('\n')
      toolbox.print.info('======')
      toolbox.print.info('Breaks')
      toolbox.print.info('======')
      toolbox.print.info(
        'Breaks are a quick way to set your Slack status and let your coworkers know when you are away on a break.'
      )
      toolbox.print.info('\n')
      toolbox.print
        .info(`If you pass a --reason argument, Makerflow will automatically set an appropriate status and emoji 
for you on Slack. For instance, if you run makerflow break start --reason=lunch, it will set 🥪 
emoji as your status icon. If you don't supply a reason, your status will be set to ⏸.

Reasons currently supported are lunch (🥪), coffee (☕️), tea (🍵), beverage (🥤), walk (👟), run (🏃), workout (💪), 
child (👶), and doctor (🏥).`)
      toolbox.print.info('\n')
      toolbox.print.info('Commands')
      toolbox.print.info('--------')
      toolbox.print.info(
        'break start                 - Start a beak. Sets your Slack status emoji to ⏸'
      )
      toolbox.print.info(
        'break start --reason=<type> - Start a break with a specific reason. Supported values for reason are one of lunch, coffee, tea, beverage, walk, run, workout, child, doctor'
      )
      toolbox.print.info(
        'break stop                  - Finish your break. Slack status is cleared.'
      )
      toolbox.print.info('\n')
      toolbox.print.info('=============================')
      toolbox.print.info('Events (from Google Calendar)')
      toolbox.print.info('=============================')
      toolbox.print.info(
        'See ongoing and upcoming events from Google Calendar for the next three hours'
      )
      toolbox.print.info(
        'You can connect your Google Calendar with Makerflow from the "Setup Integrations" (https://app.makerflow.co/integrations) page on the website'
      )
      toolbox.print.info('\n')
      toolbox.print.info('Commands')
      toolbox.print.info('--------')
      toolbox.print.info(
        'events list - See ongoing and upcoming events from Google Calendar for the next three hours'
      )
      toolbox.print.info('\n')
      toolbox.print.info('=============')
      toolbox.print.info('Configuration')
      toolbox.print.info('=============')
      toolbox.print.info(
        'Configure Makerflow CLI with your preferences and account'
      )
      toolbox.print.info('\n')
      toolbox.print.info('Commands')
      toolbox.print.info('--------')
      toolbox.print.info(
        'config token            - Set your Makerflow API token. You can get a new token from https://app.makerflow.co/settings#api. Run this command and follow the prompts on your screen.'
      )
      toolbox.print.info(
        'config kill             - Configure whether any chat apps like Slack/Discord/MS Teams/Telegram/Messages/WhatsApp you have open should be closed when Flow Mode is started and reopened when Flow Mode is stopped. Run this command and follow the prompts on your screen to complete setup.'
      )
      toolbox.print.info(
        "config default-duration - Configure how long you want your usual Flow Modes to run for a pomodoro like timed experience."
      )
    }) // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    // enable the following method if you'd like to skip loading one of these core extensions
    // this can improve performance if they're not necessary for your project:
    //   .exclude(['print', 'http'])
    // and run it and send it back (for testing, mostly)
    .create()

  return cli.run(argv)
}

module.exports = { run }
