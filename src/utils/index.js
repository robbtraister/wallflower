'use strict'

const sleep = async n =>
  new Promise(resolve => {
    setTimeout(resolve, n)
  })

module.exports = {
  sleep
}
