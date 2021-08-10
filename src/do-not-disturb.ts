const os = require('os')
const dnd = require('mindful-timer/src/dnd')

export const enable = function() {
  if (os.type() === 'Darwin') {
    dnd.getDndProvider().enable()
  }
}

export const disable = function() {
  if (os.type() === 'Darwin') {
    dnd.getDndProvider().disable()
  }
}
