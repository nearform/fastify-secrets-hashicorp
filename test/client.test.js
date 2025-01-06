'use strict'

const { test, beforeEach } = require('node:test')

const proxyquire = require('proxyquire')

class Stub {
  read() {}
}

const HashiCorpClient = proxyquire('../lib/client', {
  'node-vault': () => new Stub()
})

beforeEach(async () => {
  Stub.prototype.read = Promise.resolve()
})

test('get', async (t) => {
  t.plan(2)

  await t.test('read', async (t) => {
    t.plan(3)

    const client = new HashiCorpClient({ mountPoint: 'unit-test-secrets' })
    Stub.prototype.read = t.mock.fn(() =>
      Promise.resolve({
        data: {
          data: {
            value: 'secret payload'
          }
        }
      })
    )

    const secret = await client.get({ name: 'name', key: 'value' })

    t.assert.ok(Stub.prototype.read.mock.callCount(), 'calls read')
    t.assert.deepStrictEqual(
      Stub.prototype.read.mock.calls[0].arguments[0],
      'unit-test-secrets/data/name',
      'provides name to read'
    )
    t.assert.deepStrictEqual(secret, 'secret payload', 'extracts SecretString')
  })

  await t.test('sdk error', async (t) => {
    t.plan(1)
    const client = new HashiCorpClient()

    Stub.prototype.read = t.mock.fn(() => Promise.reject(new Error()))

    const promise = client.get('unit-test-secrets/name')

    await t.assert.rejects(promise, 'throws error')
  })
})
