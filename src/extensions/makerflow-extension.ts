import { GluegunParameters, GluegunPrint, GluegunToolbox } from 'gluegun'
import * as dnd from '../do-not-disturb'
import { ApiResponse } from 'apisauce'
import { homedir } from 'os'
import TodoUtils from './todo-utils'
import { capitalize, findIndex } from 'lodash'
import {
  compareAsc,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInSeconds,
  formatDistanceStrict,
  isAfter,
  isBefore,
  isSameMinute,
  parseJSON
} from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { setPassword, getPassword, deletePassword } from 'keytar'

const API_TOKEN_UNAVAILABLE = 'API token not available'
const CONFIG_FILENAME = homedir() + '/.makerflowrc.json'
const pathToKilledAppsList = `/tmp/makerflow-kill.txt`

module.exports = (toolbox: GluegunToolbox) => {

  class MakerflowApiResult {
    public error: Error
    public response: ApiResponse<any>

    constructor(error?: Error, result?: ApiResponse<any>) {
      this.error = error
      this.response = result
    }
  }

  async function executeApi(startingMessage: string, url: string, successMessage: string,
                            method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH' | 'purge' | 'PURGE' | 'link' | 'LINK' | 'unlink' | 'UNLINK'
    , data: object): Promise<MakerflowApiResult> {
    let apiToken = null;
    if (process.env.MAKERFLOW_API_TOKEN) {
      apiToken = process.env.MAKERFLOW_API_TOKEN;
    } else {
      let passwordExists = await toolbox.passwordExists()
      if (!passwordExists) return new MakerflowApiResult(Error(API_TOKEN_UNAVAILABLE), null)
      apiToken = await getPassword('makerflow', 'default')
    }
    const { print, parameters } = toolbox
    let spinner = null
    if (!parameters.options.json) {
      spinner = print.spin(startingMessage)
    }
    let source = 'cli'
    if (parameters.options.hasOwnProperty('source') && parameters.options.source.trim().length > 0) {
      source = parameters.options.source;
    }
    let baseURL = 'https://app.makerflow.co/api/'
    if (process.env.MAKERFLOW_API_URL) {
      baseURL = process.env.MAKERFLOW_API_URL
    }
    const api = toolbox.http.create({ baseURL: baseURL })
    let config = { method: method, url: `${url}?api_token=${apiToken}&source=${source}` }
    if (data) {
      config['data'] = data
    }
    const response = await api.any(config)
    if (parameters.options.json) {
      if (!response.ok) {
        print.error(response.originalError)
      } else if (response.ok) {
        print.info(JSON.stringify(response.data))
      }
    } else if (spinner) {
      if (!response.ok) {
        spinner.fail('An error occurred while executing the operation.')
      } else if (successMessage) {
        spinner.succeed(successMessage)
      } else {
        spinner.stop()
      }
    }
    return new MakerflowApiResult(null, response)
  }

  toolbox.postApi = async (startingMessage: string, url: string, successMessage: string, data?: object): Promise<MakerflowApiResult> => {
    return executeApi(startingMessage, url, successMessage, 'post', data)
  }

  toolbox.getApi = async (startingMessage: string, url: string, successMessage: string): Promise<MakerflowApiResult> => {
    return executeApi(startingMessage, url, successMessage, 'get', null)
  }

  function apiTokenUnavailableMessage(error) {
    if (error && error.message === API_TOKEN_UNAVAILABLE) {
      toolbox.print.error(API_TOKEN_UNAVAILABLE)
      toolbox.print.info('Set your API token with \'makerflow config token\'')
    }
  }

  toolbox.beginFlowMode = async () => {
    let startingMessage = 'Starting flow mode'
    let successMessage = 'Flow mode started'
    let error = null
    let response = null
    if (!toolbox.parameters.options.clientOnly) {
      let data = null
      let config = toolbox.mfConfig()
      if ((toolbox.parameters.options.hasOwnProperty("duration") && toolbox.parameters.options.duration !== null)
          || config.defaultDuration !== "None") {
        let duration: string | boolean
        if (!toolbox.parameters.options.duration &&
           // gluegun will set toolbox.parameters.options.duration to false if the --no-duration flag is passed
           // So we need to check for that
           toolbox.parameters.argv.indexOf('--no-duration') !== -1) {
          duration = false
        } else if (toolbox.parameters.options.duration) {
          duration = toolbox.parameters.options.duration
        } else {
          duration = config.defaultDuration
        }
        if (typeof duration === 'string' || typeof duration === 'number') {
          data = { duration: parseInt(duration, 10) }
          startingMessage += ` for ${duration} minutes`
          successMessage += ` for ${duration} minutes.`
        }
      }
      const result = await toolbox.postApi(startingMessage, '/flow-mode/start', successMessage, data)
      error = result.error
      response = result.response
      apiTokenUnavailableMessage(error)
    } else if (!toolbox.parameters.options.json) {
      toolbox.print.info(successMessage)
    }
    if (toolbox.parameters.options.clientOnly || (error == null && response.status >= 200 && response.status < 300)) {
      dnd.enable()
      let config = toolbox.mfConfig()
      if (config.alwaysKill || toolbox.parameters.options.kill) {
        let appsToKill = config.appsToKill
        for (const app of appsToKill) {
          toolbox.system.run(`pgrep "${app}"`).then(output => {
            if (output && output.trim().length > 0) {
              // tslint:disable-next-line:no-floating-promises
              toolbox.system.run(`pkill "${app}"`).then(() => {
                toolbox.filesystem.appendAsync(pathToKilledAppsList, app)
                  .then(() => { /* Nothing to do here */ })
                  .catch(() => { /* Nothing to do here */ });
              })
            }
          }).catch(() => {/* do nothing */})
        }
      }
    }
  }

  toolbox.endFlowMode = async () => {
    const startingMessage = 'Stopping flow mode'
    const successMessage = 'Flow mode stopped'
    let error = null
    let response = null
    if (!toolbox.parameters.options.clientOnly) {
      const result = await toolbox.postApi(startingMessage, '/flow-mode/stop', successMessage)
      error = result.error
      response = result.response
      apiTokenUnavailableMessage(error)
    } else if (!toolbox.parameters.options.json) {
      toolbox.print.info(successMessage)
    }
    if (toolbox.parameters.options.clientOnly || (error === null && response.status >= 200 && response.status < 300)) {
      dnd.disable()
      let config = toolbox.mfConfig()
      if ((config.alwaysKill || toolbox.parameters.options.kill) && toolbox.filesystem.exists(pathToKilledAppsList)) {
        let appsToKill = config.appsToKill
        const killedApps = toolbox.filesystem.read(pathToKilledAppsList)
        for (const app of appsToKill) {
          if (killedApps.indexOf(app) !== -1) {
            // tslint:disable-next-line:no-floating-promises
            toolbox.system.run(`open "/Applications/${app}.app"`)
          }
        }
        toolbox.filesystem.removeAsync(pathToKilledAppsList)
          .then(() => { /* Nothing to do here */ })
          .catch(() => { /* Nothing to do here */ })
      }
    }
  }

  toolbox.ongoingFlowMode = async () => {
    const startingMessage = 'Checking if flow mode is ongoing'
    const url = '/flow-mode/ongoing'
    const { error, response } = await toolbox.getApi(startingMessage, url, null)
    apiTokenUnavailableMessage(error)
    const { print, parameters } = toolbox
    if (error === null && response.status >= 200 && response.status < 300) {
      if (parameters.options.json) return
      if (response.data !== null && response.data.data.hasOwnProperty('id')) {
        let ongoingMessage = 'Flow Mode is currently ongoing'
        ongoingMessage += `.\nStarted ${formatDistanceStrict(parseJSON(response.data.data.start), Date.now(), {addSuffix: true})}`
        if (response.data.data.hasOwnProperty('scheduled_end')) {
          ongoingMessage += `.\nEnding ${formatDistanceStrict(parseJSON(response.data.data.scheduled_end), Date.now(), {addSuffix: true})}.`
        }
        print.success(ongoingMessage)
      } else {
        print.success('No Flow Mode currently ongoing')
      }
    }
  }

  toolbox.toggleFlowMode = async () => {
    const url = '/flow-mode/ongoing'
    const { error, response } = await toolbox.getApi(null, url, null)
    apiTokenUnavailableMessage(error)
    if (error === null && response.status >= 200 && response.status < 300) {
      if (response.data !== null && response.data.data.hasOwnProperty('id')) {
        await toolbox.endFlowMode()
      } else {
        await toolbox.beginFlowMode()
      }
    }
  }

  toolbox.mfConfig = () => {
    const {
      config: { loadConfig },
      runtime: { brand },
      filesystem: { write, exists }
    } = toolbox
    if (!exists(CONFIG_FILENAME)) {
      write(CONFIG_FILENAME, {
        alwaysKill: false,
        appsToKill: [],
        credentialsSetup: false,
        onboarding: {
          apiSetupComplete: true
        },
        defaultDuration: 'None'
      })
    }
    let config = loadConfig(brand, homedir())
    if (!config.hasOwnProperty('alwaysKill')) {
      config.alwaysKill = false
      toolbox.filesystem.write(CONFIG_FILENAME, config)
    }
    if (!config.hasOwnProperty('appsToKill')) {
      config.appsToKill = []
      toolbox.filesystem.write(CONFIG_FILENAME, config)
    }
    if (!config.hasOwnProperty('credentialsSetup')) {
      config.credentialsSetup = false
      toolbox.filesystem.write(CONFIG_FILENAME, config)
    }
    if (!config.hasOwnProperty('onboarding')) {
      config.onboarding = {
        apiSetupComplete: true
      }
      toolbox.filesystem.write(CONFIG_FILENAME, config)
    }
    if (!config.hasOwnProperty('defaultDuration')) {
      config.defaultDuration = 'None'
      toolbox.filesystem.write(CONFIG_FILENAME, config)
    }
    return config
  }

  toolbox.updateMfConfig = async (key, value) => {
    let config = toolbox.mfConfig()
    config[key] = value
    toolbox.filesystem.write(CONFIG_FILENAME, config)
  }

  toolbox.beginBreak = async () => {
    const startingMessage = 'Starting your break'
    const successMessage = 'Break started.'
    const url = '/work-break/start'
    let data = { reason:  'no-reason'}
    if (toolbox.parameters.options.hasOwnProperty('reason')) {
      data.reason = toolbox.parameters.options.reason
    }
    const { error } = await toolbox.postApi(startingMessage, url, successMessage, data)
    apiTokenUnavailableMessage(error)
  }

  toolbox.stopBreak = async () => {
    const startingMessage = 'Stopping your break'
    const successMessage = 'Break stopped.'
    const url = '/work-break/stop'
    const { error } = await toolbox.postApi(startingMessage, url, successMessage)
    apiTokenUnavailableMessage(error)
  }

  toolbox.ongoingBreak = async () => {
    const startingMessage = 'Checking if you have a break currently in progress'
    const url = '/work-break/ongoing'
    const { error, response } = await toolbox.getApi(startingMessage, url, null)
    apiTokenUnavailableMessage(error)
    const { print, parameters } = toolbox
    if (error === null && response.ok) {
      if (parameters.options.json) return
      if (response.data !== null && response.data.hasOwnProperty('id')) {
        print.success('A break is currently in progress')
      } else {
        print.success('Not currently taking a break')
      }
    }
  }

  toolbox.filterTodosByType = (parameters: GluegunParameters, formattedTodos: any[]) => {
    if (parameters.options.hasOwnProperty('source') && typeof parameters.options.source === 'string') {
      formattedTodos = formattedTodos.filter(todo => todo.type.toLowerCase().indexOf(parameters.options.source.toLowerCase()) !== -1)
    }
    return formattedTodos
  }

  toolbox.getTasksTodo = async () => {
    const startingMessage = 'Fetching your tasks'
    const url = '/tasks/todo'
    const { error, response } = await toolbox.getApi(startingMessage, url, null)
    apiTokenUnavailableMessage(error)
    const { print, parameters } = toolbox
    if (parameters.options.json) return
    if (error === null && response.ok) {
      let formattedTodos = []
      if (response.data !== null && response.data.length > 0) {
        formattedTodos = response.data.map(TodoUtils.enrichTodo).filter(t => t != null)
        formattedTodos = toolbox.filterTodosByType(parameters, formattedTodos)
        if (formattedTodos.length === 0) {
          print.success('No pending tasks')
          return
        }
        let output = [
          ['Source', 'Title', 'Description']
        ]
        for (const todo of formattedTodos) {
          output.push([capitalize(todo.type).replace("_", "").replace("im", "").replace("mp", "").replace("channel", ""), todo.description, todo.sourceDescription])
        }
        toolbox.print.table(output, {format: 'markdown'})
      }
    }
  }

  toolbox.getCalendarEvents = async () => {
    const startingMessage = 'Fetching your calendar events'
    const url = '/tasks/calendar/events'
    const { error, response } = await toolbox.getApi(startingMessage, url, null)
    apiTokenUnavailableMessage(error)
    const { print, parameters } = toolbox
    if (parameters.options.json) return
    if (error === null && response.ok) {
      if (response.data !== null && response.data.hasOwnProperty("events") && response.data.events.length > 0) {
        let output = [
          ['Status', 'Time', 'Title', 'Video Link']
        ]
        for (const event of response.data.events) {
          let uri = getVideoUriFromCalendarEvent(event)
          output.push([calendarEventOngoingUpcoming(event), formatCalendarTime(event), event.summary, uri])
        }
        toolbox.print.table(output, {format: 'markdown'})
      } else {
        print.success('No ongoing or upcoming events found')
      }
    }
  }

  function tryToOpenGoogleMeet(print: GluegunPrint, event, wait: boolean) {
    const url = getVideoUriFromCalendarEvent(event)
    const status = calendarEventOngoingUpcoming(event)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const eventStart = utcToZonedTime(parseJSON(event.start), timeZone);
    if (url && (status === "Ongoing" || !wait)) {
      print.info('Opening Google Meet for ' + event.summary)
      openGoogleMeet(url, print)
    } else if (url && status === "Upcoming" && wait) {
      const spinner = print.spin(`Opening Google Meet (${url}) for event titled "${event.summary}" in ${differenceInSeconds(eventStart, Date.now())} seconds`)
      const printer = setInterval(() => {
        spinner.text = print.colors.info(`Opening Google Meet (${url}) for event titled "${event.summary}"" in ${differenceInSeconds(eventStart, Date.now())} seconds`)
      }, 1000)
      const milis = differenceInMilliseconds(eventStart, Date.now())
      setTimeout(() => {
        clearInterval(printer)
        spinner.succeed(`Opening Google Meet (${url}) for event titled "${event.summary}"`)
        openGoogleMeet(url, print)
      }, milis)
    } else {
      print.info('Google Meet URL not found for ' + event.summary)
    }
  }

  function openGoogleMeet(url: any, print: GluegunPrint) {
    toolbox.system.run('open ' + url)
      .then(() => print.success("Opened " + url))
      .catch(() => print.error("Error encountered while opening URL " + url))
  }

  async function printGoogleMeetUrls(print: GluegunPrint, status: string, events: any[], wait: boolean) {
    let choices = []
    for (const thisEvent of events) {
      let uri = getVideoUriFromCalendarEvent(thisEvent)
      choices.push(calendarEventOngoingUpcoming(thisEvent) + " | " + formatCalendarTime(thisEvent) + " | " + thisEvent.summary + " | " + uri)
    }
    const response = await toolbox.prompt.ask({
      type: 'select',
      separator: true,
      choices,
      message: `Multiple ${status} events found. Please select one to open.`,
      name: 'eventToOpen'
    })
    if (typeof response.eventToOpen !== "string" || response.eventToOpen.length === 0) {
      print.error("Invalid choice")
      return;
    }
    const eventIndex = findIndex(choices, (c: any) => c.value.trim() === response.eventToOpen.trim())
    const event = events[eventIndex];
    tryToOpenGoogleMeet(print, event, wait);
  }

  toolbox.openCalendarEvent = async () => {
    const startingMessage = 'Opening your calendar event'
    const url = '/tasks/calendar/events'
    const { error, response } = await toolbox.getApi(startingMessage, url, null)
    apiTokenUnavailableMessage(error)
    const { print, parameters } = toolbox
    if (parameters.options.json) return
    if (error === null && response.ok) {
      if (response.data !== null && response.data.hasOwnProperty("events") && response.data.events.length > 0) {
        let upcoming = []
        let ongoing = []
        for (const event of response.data.events.sort((a, b) => compareAsc(parseJSON(a.start), parseJSON(b.start)))) {
          const status = calendarEventOngoingUpcoming(event)
          if (status === "Ongoing" && differenceInMinutes(parseJSON(event.end), Date.now()) > 1) {
            ongoing.push(event)
          } else if (status === "Upcoming") {
            upcoming.push(event)
          }
        }
        if (ongoing.length === 1 && !parameters.options.next) {
          const event = ongoing[0]
          tryToOpenGoogleMeet(print, event, false)
        } else if (ongoing.length > 1 && !parameters.options.next) {
          const status = `ongoing`
          await printGoogleMeetUrls(print, status, ongoing, false)
        } else if (upcoming.length > 0 || parameters.options.next) {
          const eventsStartingInLessThanFiveMinutes = upcoming.filter(event => differenceInMinutes(Date.now(), parseJSON(event.start)) <= 5)
          if (eventsStartingInLessThanFiveMinutes.length === 1) {
            tryToOpenGoogleMeet(print, eventsStartingInLessThanFiveMinutes[0], parameters.options.wait)
          } else if (eventsStartingInLessThanFiveMinutes.length > 1) {
            const status = `upcoming`
            await printGoogleMeetUrls(print, status, eventsStartingInLessThanFiveMinutes, parameters.options.wait)
          } else {
            print.info("No events found starting in the next 5 minutes")
          }
        } else {
          print.success('No ongoing or upcoming events found')
        }
      } else {
        print.error('There was an error connecting with your Calendar')
      }
    }
  }

  toolbox.markAsDone = async (stringifiedTodo: string) => {
    const todo = JSON.parse(stringifiedTodo)
    if (!todo || !todo.hasOwnProperty('type')) return
    const startingMessage = `Marking ${capitalize(todo.type).replace("_", "").replace("im", "").replace("mp", "").replace("channel", "")} | ${todo.description} | ${todo.sourceDescription} as done`
    const successMessage = `$${capitalize(todo.type).replace("_", "").replace("im", "").replace("mp", "").replace("channel", "")} | ${todo.description} | ${todo.sourceDescription} marked as done`
    const url = '/tasks/todo/done'
    const { error } = await toolbox.postApi(startingMessage, url, successMessage, {todo: todo, done: true})
    apiTokenUnavailableMessage(error)
  }

  function getVideoUriFromCalendarEvent(event: any) {
    return event.conference !== null && event.conference.entryPoints.filter(e => e.entryPointType === 'video').length ? event.conference.entryPoints.filter(e => e.entryPointType === 'video')[0].uri : ''
  }

  function calendarEventOngoingUpcoming(calendarEvent) {
    const now = new Date(new Date().toUTCString());
    let start = parseJSON(calendarEvent.start);
    let end = parseJSON(calendarEvent.end);
    if (isSameMinute(start, now)) {
      return "Ongoing";
    }
    if (isBefore(start, now)) {
      if (isAfter(end, now)) {
        return "Ongoing";
      } else {
        return "Ended";
      }
    }
    if (isAfter(start, now)) {
      return "Upcoming";
    }
  }

  function formatCalendarTime(calendarEvent) {
    const now = Date.now();
    const start = parseJSON(calendarEvent.start);
    const end = parseJSON(calendarEvent.end)
    let time = `${format(start, 'hh:mm aaa')} - ${format(end, 'hh:mm aaa')} | `
    if (isSameMinute(start, now)) {
      return time + "is starting now" + " | ending in "  + formatDistanceStrict(now, end);
    }
    if (isBefore(start, now)) {
      if (isAfter(end, now)) {
        return time + "started " + formatDistanceStrict(start, now, {addSuffix: true}) + " | ending in " + formatDistanceStrict(now, end);
      } else {
        return time + "ended " + formatDistanceStrict(end, now, {addSuffix: true});
      }
    }
    if (isAfter(start, now)) {
      return time + "starting in " + formatDistanceStrict(now, start);
    }
  }

  toolbox.recordProductiveActivity = async () => {
    const url = '/productive-activity'
    const { error } = await toolbox.postApi(null, url, null, [toolbox.parameters.options.min, toolbox.parameters.options.max])
    apiTokenUnavailableMessage(error)
  }

  toolbox.passwordExists = async () => {
    let config = toolbox.mfConfig()
    let passwordExists = false
    if (config.hasOwnProperty('credentialsSetup') && config.credentialsSetup) {
      const pwd = await getPassword('makerflow', 'default')
      passwordExists = pwd !== null && pwd.trim().length > 5
    }
    return passwordExists
  }

  toolbox.setupApiToken = async () => {
    let token = null;
    let config = toolbox.mfConfig();
    if (toolbox.parameters.options.hasOwnProperty("check") && toolbox.parameters.options.check) {
      let passwordExists = await toolbox.passwordExists()
      toolbox.print.success(passwordExists)
      return true;
    }
    if (toolbox.parameters.options.hasOwnProperty("delete") && toolbox.parameters.options.delete) {
      if (config.hasOwnProperty("credentialsSetup") && config.credentialsSetup) {
        const spinner = toolbox.print.spin('Deleting token...')
        await deletePassword('makerflow', 'default')
        spinner.succeed('Token deleted')
      } else {
        toolbox.print.error("No token to delete.")
      }
      return true;
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
      return true
    }
  }

  const supportedApps = ["Slack", "Discord", "WhatsApp", "Telegram", "Microsoft Teams"]
  toolbox.configureAppKilling = async () => {
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
    const alwaysKillOption = "Every time Flow Mode is started or stopped"
    const userSpecifiedKillOption = "Only when Flow Mode is started or stopped with --kill option"
    const result = await prompt.ask([
      {
        type: 'select',
        name: 'alwaysKill',
        message: "When would would you like to close/reopen distracting apps? You will select apps to close/reopen in the next step.",
        choices: [alwaysKillOption, userSpecifiedKillOption],
        initial: alwaysKill ? 0 : 1
      },
      {
        type: 'multiselect',
        name: 'appsToKill',
        choices: choices,
        message: "Which of these apps would you like to close? (select with spacebar, confirm with enter)",
      }
    ])
    updateMfConfig('alwaysKill', result['alwaysKill'] === alwaysKillOption)
    updateMfConfig('appsToKill', result['appsToKill'])
    config = mfConfig()
    if (config.alwaysKill && config.appsToKill.length > 0) {
      success("Following apps will always be closed when Flow Mode has started, and reopened when it ends: " + config.appsToKill.join(", "))
    } else if (config.appsToKill.length > 0) {
      success("Following apps will be closed when Flow Mode has started with `makerflow toggle --kill` or `makerflow start --kill`: " + config.appsToKill.join(", "))
      success("Following apps will be reopened when Flow Mode is ended with `makerflow toggle --kill` or `makerflow stop --kill`: " + config.appsToKill.join(", "))
    } else {
      success("No apps will be closed when Flow Mode has started, or reopened when it ends.")
    }
  }

  toolbox.setupDefaultDuration = async () => {
    const {
      mfConfig,
      print: { success },
      updateMfConfig,
      prompt
    } = toolbox
    let config = mfConfig()
    let defaultDuration = config.defaultDuration;
    const result = await prompt.ask([
      {
        type: 'select',
        name: 'defaultDuration',
        message: "How long would you like your Flow Mode sessions to be (in minutes)? Choose None to manually disable Flow Mode.",
        choices: ["None", "25", "50" , "75", "Other"],
        initial: defaultDuration
      }
    ])
    if (result['defaultDuration'] === "Other") {
      const result2 = await prompt.ask([
        {
          type: 'input',
          name: 'defaultDuration',
          message: "How long would you like your default Flow Mode sessions to be? (in minutes)",
        }
      ])
      updateMfConfig('defaultDuration', result2['defaultDuration'])
    } else {
      updateMfConfig('defaultDuration', result['defaultDuration'])
    }
    success("Default Flow Mode duration set to " + result['defaultDuration'] + " minutes.")
  }

}
