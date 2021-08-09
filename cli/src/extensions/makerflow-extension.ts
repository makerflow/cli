import { GluegunToolbox } from 'gluegun'
import * as dnd from '../do-not-disturb'
import * as keytar from 'keytar'
import { ApiResponse } from 'apisauce'

const API_TOKEN_UNAVAILABLE = 'API token not available'
module.exports = (toolbox: GluegunToolbox) => {

  const api = toolbox.http.create({ baseURL: 'https://app.makerflow.co/api/' })

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
  ): Promise<MakerflowApiResult> {
    let apiToken = await keytar.findPassword('makerflow')
    if (apiToken === null) return new MakerflowApiResult(Error(API_TOKEN_UNAVAILABLE), null)
    const { print, parameters } = toolbox
    let spinner = null
    if (!parameters.options.json) {
      spinner = print.spin(startingMessage)
    }
    const response = await api.any({ method: method, url: `${url}?api_token=${apiToken}` })
    print.debug(response)
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
      }  else {
        spinner.stop()
      }
    }
    return new MakerflowApiResult(null, response)
  }

  toolbox.postApi = async (startingMessage: string, url: string, successMessage: string): Promise<MakerflowApiResult> => {
    return executeApi(startingMessage, url, successMessage, 'post')
  }

  toolbox.getApi = async (startingMessage: string, url: string, successMessage: string): Promise<MakerflowApiResult> => {
    return executeApi(startingMessage, url, successMessage, 'get')
  }

  function apiTokenUnavailableMessage(error) {
    if (error && error.message === API_TOKEN_UNAVAILABLE) {
      toolbox.print.error(API_TOKEN_UNAVAILABLE)
      toolbox.print.info('Set your API token with \'makerflow config token\'')
      toolbox.print.info('Or, use without API token with \'makerflow config local true\'')
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
    }
  }

  toolbox.endFlowMode = async () => {
    const startingMessage = 'Stopping flow mode'
    const successMessage = 'Flow mode stopped.'
    const url = '/flow-mode/stop'
    const { error, response } = await toolbox.postApi(startingMessage, url, successMessage)
    apiTokenUnavailableMessage(error)
    if (response.status >= 200 && response.status < 300) {
      dnd.disable()
    }
  }

  toolbox.ongoingFlowMode = async () => {
    const startingMessage = 'Checking if flow mode is ongoing'
    const url = '/flow-mode/ongoing'
    const { error, response } = await toolbox.getApi(startingMessage, url, null)
    apiTokenUnavailableMessage(error)
    const { print, parameters } = toolbox
    if (response.status >= 200 && response.status < 300) {
      if (parameters.options.json) {
        print.info(JSON.stringify(response.data))
      } else if (response.data !== null && response.data.hasOwnProperty('id')) {
        print.success('Flow Mode is currently ongoing')
      } else {
        print.success('No Flow Mode currently ongoing')
      }
    }
  }
}
