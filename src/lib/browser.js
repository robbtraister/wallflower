'use strict'

const fs = require('fs')
const path = require('path')

const debug = require('debug')('wallflower:browser')
const webdriver = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/chrome')

const sites = require('./sites')

const { up } = require('../../bin')

const {
  ENVIRONMENT_NAME,
  HUB_HOST,
  HUB_PORT,
  IN_DOCKER,
  PROJECT_ROOT,
  TARGET
} = require('../../env')

async function loadExtension (extensionName) {
  debug(`Reading extension: ${extensionName}`)
  const extensionFile = path.join(
    IN_DOCKER ? '/opt/project' : PROJECT_ROOT,
    'extensions',
    extensionName,
    `${ENVIRONMENT_NAME}.crx`
  )
  return new Promise((resolve, reject) => {
    fs.readFile(extensionFile, (err, data) => {
      debug(`Sending extension: ${extensionName}`)
      err ? reject(err) : resolve(data.toString('base64'))
    })
  })
}

let waitForHub

async function Browser ({ extensions = [] } = {}) {
  const IS_LOCAL = TARGET === 'local'
  const downloadDirectory = IS_LOCAL
    ? path.resolve('~/Downloads')
    : '/home/seluser/Downloads'

  let builder = new webdriver.Builder().forBrowser('chrome').setChromeOptions(
    new Options()
      .setUserPreferences({
        'download.default_directory': downloadDirectory,
        'download.prompt_for_download': false,
        'extensions.ui.developer_mode': true,
        'savefile.default_directory': downloadDirectory
      })
      .addExtensions(
        await Promise.all([].concat(extensions || []).map(loadExtension))
      )
  )

  if (!IS_LOCAL) {
    debug('Waiting for selenium hub')
    waitForHub = waitForHub || up()
    await waitForHub

    debug('Using selenium server')
    builder = builder.usingServer(
      // if run in host, access hub at `localhost:4444`
      // if run in container, use env variable overrides to access hub container
      `http://${HUB_HOST}:${HUB_PORT}/wd/hub`
    )
  }

  const browser = await builder.build()

  Object.keys(sites)
    .forEach((siteName) => {
      const Site = sites[siteName]
      browser[siteName] = ({ ...args }) => new Site({ browser, ...args })
    })

  return browser
}

module.exports = Browser
