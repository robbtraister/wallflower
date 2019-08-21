'use strict'

const webdriver = require('selenium-webdriver')
const { sleep } = require('../../utils')

const URL = 'http://mail.google.com/'

const SELECTORS = {
  USERNAME: webdriver.By.name('identifier'),
  PASSWORD: webdriver.By.name('password'),
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
    await this.setTo(to)
    await this.setSubject(subject)
    await this.setBody(body)
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
  constructor (browser, fields) {
    this._browser = browser
    return this.init(fields)
  }

  get browser () {
    return this._browser
  }

  async compose (fields) {
    await this._browser.findElement(SELECTORS.COMPOSE).click()
    await sleep(1000)

    const draft = new Draft(this, this._browser.findElement(SELECTORS.DRAFT))

    return draft.init(fields)
  }

  async init ({ username, password }) {
    return this.login(username, password)
  }

  async login (username, password) {
    await this._browser.get(URL)

    await this._browser
      .findElement(SELECTORS.USERNAME)
      .sendKeys(username, webdriver.Key.RETURN)
    await sleep(3000)
    await this._browser
      .findElement(SELECTORS.PASSWORD)
      .sendKeys(password, webdriver.Key.RETURN)
    await sleep(3000)

    return this
  }
}

module.exports = GMail
