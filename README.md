# Wallflower

Wallflower is a browser-driver test harness that is designed to run in the background of your host machine.

## Goals

1.  No Focus
    -   Should be able to run in the background on your local machine
1.  Simple API
    -   Should be able to run with `npm` scripts
    -   Should be able to integrate with other test runners (e.g., Mocha, Jest, etc.)

## Usage

This package exports an abstraction layer over [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) to simplify automation of certain websites (e.g., gmail). It also provides a CLI for running the tests in docker, to prevent the webdriver browser from requiring focus from your host machine.

### Test Setup

You can use any test framework of your choosing, but the following example uses [mocha](https://www.npmjs.com/package/mocha)

`./tests/browser-extension.js`
```js
'use strict'

/* global describe, it */

const assert = require('assert')

const Browser = require('wallflower')
const { down, up } = require('wallflower/bin')

describe('Browser Extension Tests', function () {
  this.timeout(30000)

  before(async function startupSeleniumContainers () {
    await up()
  })

  after(async function shutdownSeleniumContainers () {
    await down()
  })

  let browser
  beforeEach(async function openBrowser () {
    // loading extension may take a while
    this.timeout(120000)
    browser = await Browser({ extensions: ['bp'] }) // looks in `./extensions/bp/${ENVIRONMENT_NAME}.crx`
  })

  afterEach(async function closeBrowser () {
    browser && await browser.quit()
    browser = undefined
  })

  describe('GMail Tests', function () {
    let gmail
    beforeEach(async function loginToGmail () {
      // loading extension may take a while; for some reason, this timeout overrides the outer beforeEach
      this.timeout(120000)
      gmail = await browser.gmail(require('./account'))
    })

    afterEach(async function logoutOfGmail () {
      gmail && await gmail.logout()
      gmail = undefined
    })

    it('should get a message id', async function () {
      const draft = await gmail.compose({ to: 'user@gmail.com', subject: 'test', body: 'test' })

      const messageId = await draft.getMessageId()
      assert.ok(messageId.startsWith('#msg-a:'))

      await draft.discard()
    })
  })
})
```

### Running Tests

There are three (3) ways you can run wallflower tests:
1.  `npm test`
    Running your tests just as you would normally is probably the simplest method, assuming you added the `up()` and `down()` calls in the before/after hooks. In this case, the test script will execute on your host machine and communicate with the automated browser running in a docker container.
1.  `wallflower test`
    In this case, along with the browser container, another docker container will be run to execute your test script.
1.  `TARGET=local npm test`
    This will run everything on your host machine, including the automated browser. In this case, the host machine should not be used and the browser should be allowed to keep focus throughout the duration of the test. This approach also requires that the webdriver executable be installed on your host machine. This approach is not recommended, as it defeats the entire purpose of building this package; however, it may be useful or necessary in some CI environments.

## CLI

### wallflower run <script>

This is essentially an alias for `npm run <script>`, but will execute the command in a docker container as a sibling to the automated browser container.

### wallflower test

Similar to `npm test`, this is an alias for `wallflower run test`.

### wallflower debug <script>

This is essentially an alias for `wallflower run <script>`, but will open enable debug inspection on port 9229.

### wallflower up

This will start the browser container separately from your test script. This may be useful if you want to connect a VNC application for debugging purposes.

### wallflower down

If you start the browser container separately, you must shut it down separately.

### wallflower restart

Shortcut for `wallflower down && wallflower up`. Also aliased as `wallflower reset`.
