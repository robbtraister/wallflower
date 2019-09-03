'use strict'

class Base {
  constructor (...args) {
    return this.init(...args)
  }

  get browser () {
    return this._browser
  }

  async init ({ browser }) {
    this._browser = browser || (await require('../browser')())
    this.constructor.URL && (await this._browser.get(this.constructor.URL))
    return this
  }
}

module.exports = Base
