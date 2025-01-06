'use strict'

const { test, beforeEach } = require('node:test')

const sinon = require('sinon')
const proxyquire = require('proxyquire')

class Stub {
  read() {}
}

const read = sinon.stub(Stub.prototype, 'read')

const HashiCorpClient = proxyquire('../lib/client', {
  'node-vault': () => new Stub()
})

beforeEach(async () => {
  read.resolves()
})

test('get', async (t) => {
  t.plan(2)

  await t.test('read', async (t) => {
    t.plan(3)

    const client = new HashiCorpClient({ mountPoint: 'unit-test-secrets' })
    read.resolves({
      data: {
        data: {
          value: 'secret payload'
        }
      }
    })

    const secret = await client.get({ name: 'name', key: 'value' })

    t.assert.ok(read.called, 'calls read')
    t.assert.ok(read.calledWith('unit-test-secrets/data/name'), 'provides name to read')
    t.assert.equal(secret, 'secret payload', 'extracts SecretString')
  })

  await t.test('sdk error', async (t) => {
    t.plan(1)
    const client = new HashiCorpClient()

    read.rejects(new Error())

    const promise = client.get('unit-test-secrets/name')

    await t.assert.rejects(promise, 'throws error')
  })
})
