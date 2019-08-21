'use strict'

const childProcess = require('child_process')
const { promisify } = require('util')

const exec = promisify(childProcess.exec.bind(childProcess))

async function spawn (cmd, args, options) {
  return new Promise((resolve, reject) => {
    const proc = /^win/i.test(process.platform)
      ? childProcess.spawn('cmd', ['/s', '/c', cmd].concat(args), options)
      : childProcess.spawn(cmd, args, options)

    const sigintListener = () => {
      proc.kill('SIGINT')
    }
    process.once('SIGINT', sigintListener)

    proc.on('exit', code => {
      process.removeListener('SIGINT', sigintListener)
      // ensure cursor is returned
      console.log('\x1B[?25h')

      if (code === 0) {
        resolve()
      } else {
        reject(new Error(code))
      }
    })
  })
}

module.exports = {
  exec,
  spawn
}
