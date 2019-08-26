'use strict'

const childProcess = require('child_process')
const path = require('path')

const PROJECT_ROOT = path.resolve('.')
const WALLFLOWER_ROOT = path.resolve(__dirname, '..')

let IN_DOCKER = false
try {
  IN_DOCKER = childProcess.execSync('cat /proc/self/cgroup 2> /dev/null | grep \':/docker/\'').toString().trim().length > 0
} catch (_) {}

require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') })

module.exports = {
  ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME || 'production',
  HUB_HOST: process.env.HUB_HOST || (IN_DOCKER ? 'wallflower-hub' : 'localhost'),
  HUB_PORT: Number(process.env.HUB_PORT) || 4444,
  IN_DOCKER,
  PROJECT_ROOT,
  TARGET: (process.env.TARGET || 'docker').toLowerCase(),
  WALLFLOWER_ROOT
}
