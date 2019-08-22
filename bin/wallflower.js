#!/usr/bin/env node

'use strict'

const {
  debug,
  down,
  help,
  restart,
  run,
  status,
  test,
  up,
  version
} = require('.')

const commands = {
  debug,
  down,
  help: () => console.log(help()),
  restart,
  run,
  status: async () => console.log(await status()),
  test,
  up,
  version: () => console.log(version())
}

process.on('uncaughtException', err => {
  console.error(err)
})

if (module === require.main) {
  const cmd = process.argv[2]
  const fn = commands[cmd] || commands.help
  fn.apply(null, Array.prototype.slice.call(process.argv, 3))
}
