'use strict'

const { test, beforeEach } = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

class Stub {
  read() {}
}

const read = sinon.stub(Stub.prototype, 'read')

const VaultClient = proxyquire('../lib/client', {
  'node-vault': () => new Stub()
})

beforeEach(async () => {
  read.resolves()
})

test('get', (t) => {
  t.plan(2)

  t.test('read', async (t) => {
    t.plan(3)

    const client = new VaultClient()
    read.resolves({
      data: {
        value: 'secret payload'
      }
    })

    const secret = await client.get('secret/name')

    t.ok(read.called, 'calls read')
    t.ok(read.calledWith('secret/name'), 'provides name to read')
    t.equal(secret, 'secret payload', 'extracts SecretString')
  })

  t.test('sdk error', async (t) => {
    t.plan(1)
    const client = new VaultClient()

    read.rejects(new Error())

    const promise = client.get('secret/name')

    await t.rejects(promise, 'throws error')
  })
})
