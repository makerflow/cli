
import { GluegunCommand } from 'gluegun'
import TodoUtils from '../../extensions/todo-utils'
import { capitalize } from 'lodash'
import { MultiSelect } from 'enquirer/lib/prompts'

const command: GluegunCommand = {
  name: 'done',
  description: 'Get a list of pending tasks like messages in Slack or pull requests in GitHub/Bitbucket and mark them as done',
  run: async toolbox => {
    if (toolbox.parameters.options.help) {
      toolbox.print.info("==================")
      toolbox.print.info("Mark tasks as done")
      toolbox.print.info("==================")
      toolbox.print.info("See a list of pending tasks like messages in Slack or pull requests from GitHub/Bitbucket.")
      toolbox.print.info("Select one or more tasks with spacebar and hit enter to mark them as done.")
      return;
    }
    let todo = null
    if (toolbox.parameters.options.hasOwnProperty("value") && toolbox.parameters.options.value) {
      todo = toolbox.parameters.options.value;
    }
    if (todo === null && !toolbox.parameters.options.json) {
      const startingMessage = 'Fetching your tasks'
      const url = '/tasks/todo'
      const { error, response } = await toolbox.getApi(startingMessage, url, null)
      const { print, parameters } = toolbox
      if (parameters.options.json) return
      if (error === null && response.ok) {
        let formattedTodos = response.data.map(TodoUtils.enrichTodo)
        formattedTodos = toolbox.filterTodosByType(parameters, formattedTodos)
        if (formattedTodos.length === 0) {
          print.success('No pending tasks')
          return
        }
        let choices = []
        for (const thisTodo of formattedTodos) {
          choices.push({
            name: `${capitalize(thisTodo.type).replace("_", "").replace("im", "").replace("mp", "").replace("channel", "")} | ${thisTodo.description} | ${thisTodo.sourceDescription}`,
            value: thisTodo}
          )
        }
        new MultiSelect(
          {
            type: 'multiselect',
            message: `Which tasks do you want to mark as done? (select with spacebar, confirm with enter)`,
            choices: choices,
            result(names) {
             return this.map(names);
            }
          }
        ).run().then(async result => {
          const todos = Object.values(result)
        if (todos.length > 0) {
          for (const thisTodo of todos) {
            toolbox.markAsDone(JSON.stringify(thisTodo))
          }
        }
      }).catch(print.error)
      }
    } else {
      toolbox.markAsDone(todo);
    }
  },
}

module.exports = command
