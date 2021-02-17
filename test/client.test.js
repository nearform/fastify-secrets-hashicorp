'use strict'

const { test, beforeEach } = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

class Stub {
  read() {}
}

const readPromise = sinon.stub()

const read = sinon.stub(Stub.prototype, 'read').returns({
  promise: readPromise
})

const VaultClient = proxyquire('../lib/client', {
  'node-vault': () => new Stub()
})

beforeEach(async () => {
  readPromise.reset()
})

test('get', (t) => {
  t.plan(2)

  t.test('read', async (t) => {
    t.plan(3)

    const client = new VaultClient()
    readPromise.resolves('secret payload')

    const secret = await client.get('secret/name')

    t.ok(read.called, 'calls read')
    t.ok(read.calledWith('secret/name'), 'provides name to read')
    t.equal(secret, 'secret payload', 'extracts SecretString')
  })

  t.test('sdk error', async (t) => {
    t.plan(1)
    const client = new VaultClient()

    readPromise.rejects(new Error())

    const promise = client.get('secret/name')

    await t.rejects(promise, 'throws error')
  })
})
