'use strict'

const debug = require('debug')('wallflower:gmail')
const webdriver = require('selenium-webdriver')

const Base = require('./base')

const URL = 'https://www.google.com/'

const SELECTORS = {
  QUERY: webdriver.By.name('query')
}

class Google extends Base {
  async search (query) {
    debug(`Searching for "${query}"`)

    const queryInput = await this.browser.wait(
      webdriver.until.elementLocated(SELECTORS.QUERY)
    )
    debug('Found query element')
    await queryInput.sendKeys(query, webdriver.Key.RETURN)
  }

  static get URL () {
    return URL
  }
}

module.exports = Google
