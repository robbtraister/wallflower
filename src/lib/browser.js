'use strict'

const webdriver = require('selenium-webdriver')

const GMail = require('./sites/gmail')

const { up } = require('../../bin')

let waitForHub

async function Browser () {
  waitForHub = waitForHub || up()
  await waitForHub

  const browser = await new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions({
      'download.default_directory': '/home/seluser/Downloads',
      'download.prompt_for_download': false,
      'extensions.ui.developer_mode': true
    })
    .usingServer(
      // if run in host, access hub at `localhost:4444`
      // if run in container, use env variable overrides to access hub container
      `http://${process.env.HUB_HOST || 'localhost'}:${process.env.HUB_PORT ||
        '4444'}/wd/hub`
    )
    .build()

  browser.gmail = (...args) => new GMail(browser, ...args)

  return browser
}

module.exports = Browser
