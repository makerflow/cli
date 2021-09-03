import { GluegunParameters, GluegunToolbox } from 'gluegun'
import * as dnd from '../do-not-disturb'
import * as keytar from 'keytar'
import { ApiResponse } from 'apisauce'
import { homedir } from 'os'
import TodoUtils from './todo-utils'
import { capitalize } from 'lodash'
import { formatDistanceStrict, isAfter, isBefore, isSameMinute, parseJSON } from 'date-fns'

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
    let apiToken = await keytar.getPassword('makerflow', 'default')
    if (apiToken === null) return new MakerflowApiResult(Error(API_TOKEN_UNAVAILABLE), null)
    const { print, parameters } = toolbox
    let spinner = null
    if (!parameters.options.json) {
      spinner = print.spin(startingMessage)
    }
    const api = toolbox.http.create({ baseURL: 'https://app.makerflow.co/api/' })
    let config = { method: method, url: `${url}?api_token=${apiToken}` }
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
    const startingMessage = 'Starting flow mode'
    const successMessage = 'Flow mode started.'
    const url = '/flow-mode/start'
    const { error, response } = await toolbox.postApi(startingMessage, url, successMessage)
    apiTokenUnavailableMessage(error)
    if (error == null && response.status >= 200 && response.status < 300) {
      dnd.enable()
      let config = toolbox.mfConfig()
      if (config.alwaysKill || toolbox.parameters.options.kill) {
        let appsToKill = config.appsToKill
        for (const app of appsToKill) {
          toolbox.system.run(`pgrep "${app}"`).then(output => {
            if (output && output.trim().length > 0) {
              // tslint:disable-next-line:no-floating-promises
              toolbox.system.run(`pkill "${app}"`).then(() => {
                toolbox.filesystem.appendAsync(pathToKilledAppsList, app).finally(() => { /* Nothing to do here */ });
              })
            }
          }).catch(() => {/* do nothing */})
        }
      }
    }
  }

  toolbox.endFlowMode = async () => {
    const startingMessage = 'Stopping flow mode'
    const successMessage = 'Flow mode stopped.'
    const url = '/flow-mode/stop'
    const { error, response } = await toolbox.postApi(startingMessage, url, successMessage)
    apiTokenUnavailableMessage(error)
    if (error === null && response.status >= 200 && response.status < 300) {
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
        toolbox.filesystem.removeAsync(pathToKilledAppsList).finally(() => { /* Nothing to do here */ })
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
        print.success('Flow Mode is currently ongoing')
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
      write(CONFIG_FILENAME, { alwaysKill: false, appsToKill: [] })
    }
    return loadConfig(brand, homedir())
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
    let data = null
    if (toolbox.parameters.options.hasOwnProperty('reason')) {
      data = {
        reason: toolbox.parameters.options.reason
      }
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
      if (response.data !== null && response.data.length > 0) {
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
        formattedTodos = response.data.map(TodoUtils.enrichTodo)
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
    if (isSameMinute(start, now)) {
      return "is starting now" + ", ending in "  + formatDistanceStrict(now, end);
    }
    if (isBefore(start, now)) {
      if (isAfter(end, now)) {
        return "started " + formatDistanceStrict(start, now) + ", ending in " + formatDistanceStrict(now, end);
      } else {
        return "ended " + formatDistanceStrict(now, end);
      }
    }
    if (isAfter(start, now)) {
      return "starting in " + formatDistanceStrict(now, start);
    }
  }

  toolbox.recordProductiveActivity = async () => {
    const url = '/productive-activity'
    const { error } = await toolbox.postApi(null, url, null, [toolbox.parameters.options.min, toolbox.parameters.options.max])
    apiTokenUnavailableMessage(error)
  }


}
