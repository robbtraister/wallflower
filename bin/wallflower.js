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

function printHelp () {
  process.stderr.write(help())
}

async function printStatus () {
  const currentStatus = await status()
  process.stderr.write('wallflower status: ')
  process.stdout.write(currentStatus)
  process.stderr.write('\n')
}

function printVersion () {
  process.stderr.write('wallflower version: ')
  process.stdout.write(version())
  process.stderr.write('\n')
}

const commands = {
  debug,
  down,
  // '-h': printHelp,
  // '--help': printHelp,
  help: printHelp,
  restart,
  run,
  status: printStatus,
  test,
  up,
  '-v': printVersion,
  '--version': printVersion,
  version: printVersion
}

process.on('uncaughtException', err => {
  console.error(err)
})

if (module === require.main) {
  const cmd = process.argv[2]
  const fn = commands[cmd] || commands.help
  fn.apply(null, Array.prototype.slice.call(process.argv, 3))
}
