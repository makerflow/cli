const { build } = require('gluegun')

/**
 * Create the cli and kick it off
 */
async function run(argv) {
  // create a CLI runtime
  const cli = build()
    .brand('makerflow')
    .src(__dirname)
    .help() // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    // enable the following method if you'd like to skip loading one of these core extensions
    // this can improve performance if they're not necessary for your project:
    //   .exclude(['print', 'http'])
    // and run it and send it back (for testing, mostly)
    .create()

  return cli.run(argv)
}

module.exports = { run }
