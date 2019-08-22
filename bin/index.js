'use strict'

const path = require('path')

const { sleep } = require('../src/utils')
const { exec, request, spawn } = require('../src/utils/promises')

const PROJECT_ROOT = path.resolve('.')
const WALLFLOWER_ROOT = path.resolve(__dirname, '..')

const IN_DOCKER = /^true$/i.test(process.env.IN_DOCKER)

require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') })

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  RESET: '\x1b[0m'
}

const READY_STEP = 500
const readyURL = `http://${process.env.HUB_HOST || 'localhost'}:${process.env
  .HUB_PORT || '4444'}/wd/hub/status`

async function waitForReady (timeout = 20000) {
  process.stderr.write('Waiting for selenium ... ')
  for (let i = Math.ceil(timeout / READY_STEP); i > 0; i--) {
    try {
      const {
        value: { ready }
      } = await request(readyURL)
      if (ready) {
        process.stderr.write(`${COLORS.GREEN}done${COLORS.RESET}\n`)
        return
      }
    } catch (_) {}
    await sleep(READY_STEP)
  }
  process.stderr.write(`${COLORS.RED}timeout${COLORS.RESET}\n`)
  throw new Error('TIMEOUT')
}

async function debug (...args) {
  const passThroughIndex = args.indexOf('--')
  if (args.length === 0 || passThroughIndex === 0) {
    args.unshift('test')
  }
  if (passThroughIndex < 0) {
    args.push('--')
  }
  args.push('--inspect=0.0.0.0:9229')
  return run(...args)
}

let startedByProcess
async function down (log = true) {
  if (!IN_DOCKER) {
    if (startedByProcess !== false) {
      await spawn('docker-compose', ['down'], {
        cwd: WALLFLOWER_ROOT,
        env: {
          ...process.env,
          PROJECT_ROOT,
          WALLFLOWER_ROOT
        },
        stdio: log ? 'inherit' : 'pipe'
      })
      startedByProcess = undefined
    }
  }
}

function help () {
  return `wallflower: ${version()}

  debug
  down
  help
  restart
  run
  status
  test
  up
  version
`
}

async function restart () {
  await down()
  await up()
}

async function run (cmd, ...args) {
  if (!cmd || cmd === '--') {
    process.stderr.write('available scripts:\n')
    const { scripts } = require(path.join(PROJECT_ROOT, 'package.json'))
    Object.keys(scripts).forEach(scriptName => {
      process.stderr.write(`  ${scriptName}\n`)
      process.stderr.write(`    ${scripts[scriptName]}\n`)
    })
  } else if (!IN_DOCKER) {
    // spawn will throw on SIGINT
    try {
      await up()

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
            COMMAND: [cmd, ...args].join(' '),
            PROJECT_ROOT,
            WALLFLOWER_ROOT
          },
          stdio: 'inherit'
        }
      )
    } catch (e) {
      // ignore SIGINT
    } finally {
      await down()
    }
  }
}

async function status () {
  return /wallflower-hub$/m.test(await exec('docker ps')) ? 'up' : 'down'
}

async function test (...args) {
  return run('test', ...args)
}

async function up () {
  if (!IN_DOCKER) {
    startedByProcess =
      startedByProcess === undefined
        ? (await status()) === 'down'
        : startedByProcess

    if (startedByProcess) {
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
    await waitForReady()
  }
}

function version () {
  return require('../package.json').version
}

module.exports = {
  debug,
  down,
  help,
  restart,
  run,
  status,
  test,
  up,
  version
}
