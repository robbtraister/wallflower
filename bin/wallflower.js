#!/usr/bin/env node

'use strict'

const path = require('path')

const { exec, spawn } = require('../src/utils/promises')

const PROJECT_ROOT = path.resolve('.')
const WALLFLOWER_ROOT = path.resolve(__dirname, '..')

require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') })

function help () {
  version()
  console.log(`
  down
  help
  status
  test
  up
  version
`)
}

async function down (log = true) {
  await spawn('docker-compose', ['down'], {
    cwd: WALLFLOWER_ROOT,
    env: {
      ...process.env,
      PROJECT_ROOT,
      WALLFLOWER_ROOT
    },
    stdio: log ? 'inherit' : 'pipe'
  })
}

async function status () {
  console.log(/wallflower-hub$/m.test(await exec('docker ps')) ? 'up' : 'down')
}

async function test () {
  await down(false)
  // spawn will throw on SIGINT
  try {
    await spawn(
      'docker-compose',
      [
        'up',
        '--build',
        '--abort-on-container-exit',
        '--exit-code-from=wallflower-chrome-test',
        'wallflower-chrome-test'
      ],
      {
        cwd: WALLFLOWER_ROOT,
        env: {
          ...process.env,
          PROJECT_ROOT,
          WALLFLOWER_ROOT
        },
        stdio: 'inherit'
      }
    )
  } catch (e) {
  } finally {
    await down()
  }
}

async function up () {
  await down(false)
  await spawn(
    'docker-compose',
    ['-f', 'docker-compose.yml', 'up', '--build', '-d'],
    {
      cwd: WALLFLOWER_ROOT,
      env: {
        ...process.env,
        PROJECT_ROOT,
        WALLFLOWER_ROOT
      },
      stdio: 'inherit'
    }
  )
}

function version () {
  console.log(`wallflower ${require('../package.json').version}`)
}

const commands = {
  down,
  help,
  status,
  test,
  up,
  version
}

process.on('uncaughtException', err => {
  console.error(err)
})

if (module === require.main) {
  const cmd = process.argv[2]
  const fn = commands[cmd] || help
  fn.apply(null, Array.prototype.slice.call(process.argv, 3))
}
