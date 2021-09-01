const os = require('os')
const dnd = require('mindful-timer/src/dnd')
const semverParse = require('semver/functions/parse');
const fs = require('fs')
const exec = require('child_process').exec

export const enable = function() {
  if (os.type() === 'Darwin') {
    dnd.getDndProvider().enable()
  }
}

export const disable = function() {
  if (os.type() === 'Darwin') {
    dnd.getDndProvider().disable()
    const { major } = semverParse(os.release())
    if (major >= 20) {
      if (!fs.existsSync('/tmp/makerflow-controlcenter-killed.txt')) {
        exec('killall ControlCenter')
        fs.writeFileSync('/tmp/makerflow-controlcenter-killed.txt', '')
      }
    }
  }
}
