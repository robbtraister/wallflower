'use strict'

const debug = require('debug')('wallflower:gmail')
const webdriver = require('selenium-webdriver')

const URL = 'https://mail.google.com/'

const SELECTORS = {
  USERNAME: webdriver.By.name('identifier'),
  PASSWORD: webdriver.By.name('password'),
  FORGET: webdriver.By.className('BHzsHc'),
  COMPOSE: webdriver.By.css('div[gh="cm"]'),
  DRAFT: webdriver.By.className('Hd'),
  TO: webdriver.By.css('textarea[name="to"]'),
  SUBJECT: webdriver.By.css('input[name="subjectbox"]'),
  BODY: webdriver.By.css(
    'div[contenteditable="true"][aria-label="Message Body"]'
  ),
  MESSAGE_ID: webdriver.By.css('input[name="draft"]'),
  THREAD_ID: webdriver.By.css('input[name="rt"]'),
  DISCARD: webdriver.By.className('og'),
  SEND: webdriver.By.className('aoO')
}

class Draft {
  constructor (gmail, element) {
    this._gmail = gmail
    this._element = element
  }

  get browser () {
    return this._gmail.browser
  }

  get element () {
    return this._element
  }

  get gmail () {
    return this._gmail
  }

  async getMessageId () {
    return this._element.findElement(SELECTORS.MESSAGE_ID).getAttribute('value')
  }

  async getThreadId () {
    return this._element.findElement(SELECTORS.THREAD_ID).getAttribute('value')
  }

  async init ({ to, subject, body }) {
    to && (await this.setTo(to))
    subject && (await this.setSubject(subject))
    body && (await this.setBody(body))
    return this
  }

  async discard () {
    await this._element.findElement(SELECTORS.DISCARD).click()
    return this
  }

  async send () {
    await this._element.findElement(SELECTORS.SEND).click()
    return this
  }

  async setBody (body) {
    await this._element
      .findElement(SELECTORS.BODY)
      .sendKeys(body, webdriver.Key.RETURN)
    return this
  }

  async setSubject (subject) {
    await this._element
      .findElement(SELECTORS.SUBJECT)
      .sendKeys(subject, webdriver.Key.RETURN)
    return this
  }

  async setTo (to) {
    await this._element
      .findElement(SELECTORS.TO)
      .sendKeys(to, webdriver.Key.RETURN)
    return this
  }
}

class GMail {
  constructor (...args) {
    return this.init(...args)
  }

  get browser () {
    return this._browser
  }

  async compose (...args) {
    const composeButton = await this._browser.wait(
      webdriver.until.elementLocated(SELECTORS.COMPOSE)
    )
    await composeButton.click()

    const draftElement = await this._browser.wait(
      webdriver.until.elementLocated(SELECTORS.DRAFT)
    )
    const draft = new this.constructor.Draft(this, draftElement)
    return draft.init(...args)
  }

  async init ({ browser, username, password }) {
    this._browser = browser || (await require('../browser')())
    return this.login({ username, password })
  }

  async login ({ username, password }) {
    debug(`Logging into gmail as: ${username}`)
    await this._browser.get(URL)

    debug('Waiting for username element')
    const usernameInput = await this._browser.wait(
      webdriver.until.elementLocated(SELECTORS.USERNAME)
    )
    debug('Found username element')
    await usernameInput.sendKeys(username, webdriver.Key.RETURN)
    debug(`Entered username: ${username}`)
    await this._browser.wait(webdriver.until.stalenessOf(usernameInput))

    debug('Waiting for password element')
    const passwordInput = await this._browser.wait(
      webdriver.until.elementLocated(SELECTORS.PASSWORD)
    )
    debug('Found password element')
    await passwordInput.sendKeys(password, webdriver.Key.RETURN)
    debug('Entered password')
    await this._browser.wait(webdriver.until.stalenessOf(passwordInput))

    return this
  }

  async logout () {
    await this._browser.get('https://accounts.google.com/Logout')
    const forgetButton = await this._browser.wait(
      webdriver.until.elementLocated(SELECTORS.FORGET)
    )
    await forgetButton.click()
    await this._browser.wait(webdriver.until.stalenessOf(forgetButton))
  }
}

GMail.Draft = Draft
module.exports = GMail
