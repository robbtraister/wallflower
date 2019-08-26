'use strict'

const fs = require('fs')
const path = require('path')

const webdriver = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/chrome')

const GMail = require('./sites/gmail')

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
  const extensionFile = path.join(
    IN_DOCKER ? '/opt/project' : PROJECT_ROOT,
    'extensions',
    extensionName,
    `${ENVIRONMENT_NAME}.crx`
  )
  return new Promise((resolve, reject) => {
    fs.readFile(extensionFile, (err, data) => {
      err ? reject(err) : resolve(data.toString('base64'))
    })
  })
}

let waitForHub

async function Browser ({ extensions = [] } = {}) {
  let builder = new webdriver.Builder().forBrowser('chrome').setChromeOptions(
    new Options()
      .setUserPreferences({
        'download.default_directory': '/home/seluser/Downloads',
        'download.prompt_for_download': false,
        'extensions.ui.developer_mode': true,
        'savefile.default_directory': '/home/seluser/Downloads'
      })
      .addExtensions(
        await Promise.all([].concat(extensions || []).map(loadExtension))
      )
  )

  if (TARGET === 'local') {
    waitForHub = waitForHub || up()
    await waitForHub

    builder = builder.usingServer(
      // if run in host, access hub at `localhost:4444`
      // if run in container, use env variable overrides to access hub container
      `http://${HUB_HOST}:${HUB_PORT}/wd/hub`
    )
  }

  const browser = await builder.build()

  browser.gmail = ({ ...args }) => new GMail({ browser, ...args })

  return browser
}

module.exports = Browser
