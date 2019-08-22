'use strict'

const childProcess = require('child_process')
const http = require('http')
const { promisify } = require('util')

const exec = promisify(childProcess.exec.bind(childProcess))

async function request (...args) {
  return new Promise((resolve, reject) => {
    http
      .request(...args, response => {
        let data = ''

        response.on('data', chunk => {
          data += chunk
        })

        response.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
      .end()
  })
}

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
      process.stdout.write('\x1B[?25h')

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
  request,
  spawn
}
