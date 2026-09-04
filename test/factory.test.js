'use strict'

const { test } = require('node:test')

const Fastify = require('fastify')
const proxyquire = require('proxyquire')

class StubClient {
  constructor(options) {
    this.options = options
    StubClient.instances.push(this)
  }

  async get({ name, key = 'value' }) {
    return `${name}.${key}`
  }
}

StubClient.instances = []

const { createHashiCorpSecretsPlugin, kInferred } = proxyquire('../lib/fastify-secrets-hashicorp', {
  './client': StubClient
})

test('createHashiCorpSecretsPlugin', async (t) => {
  await t.test('returns a plugin function with kInferred marker', (t) => {
    const plugin = createHashiCorpSecretsPlugin({
      secrets: {
        dbPassword: { name: 'database', key: 'password' },
        apiToken: { name: 'api', key: 'token' }
      }
    })

    t.assert.equal(typeof plugin, 'function', 'returns a function')
    t.assert.equal(plugin.Client, StubClient, 'exposes the configured client')
    t.assert.equal(plugin[Symbol.for('skip-override')], true, 'preserves Fastify plugin metadata')
    t.assert.equal(plugin[Symbol.for('plugin-meta')].fastify, '5.x', 'requires Fastify 5')
    t.assert.deepStrictEqual(
      plugin[kInferred],
      { dbPassword: true, apiToken: true },
      'attaches captured keys on kInferred'
    )
  })

  await t.test('captures a single secret', (t) => {
    const plugin = createHashiCorpSecretsPlugin({
      secrets: { onlyOne: { name: 'one' } }
    })

    t.assert.deepStrictEqual(plugin[kInferred], { onlyOne: true }, 'attaches the single captured key')
  })

  await t.test('throws when secrets is missing', (t) => {
    t.assert.throws(
      () => createHashiCorpSecretsPlugin({}),
      /options\.secrets must be a non-empty object/,
      'rejects missing secrets'
    )
  })

  await t.test('throws when secrets is an empty object', (t) => {
    t.assert.throws(
      () => createHashiCorpSecretsPlugin({ secrets: {} }),
      /options\.secrets must be a non-empty object/,
      'rejects empty secrets'
    )
  })

  await t.test('throws when options is missing', (t) => {
    t.assert.throws(() => createHashiCorpSecretsPlugin(), /options object is required/, 'rejects missing options')
  })

  await t.test('registers with the captured options', async (t) => {
    const fastify = Fastify({ logger: false })
    t.after(() => fastify.close())

    const plugin = createHashiCorpSecretsPlugin({
      secrets: { dbPassword: { name: 'database', key: 'password' } },
      clientOptions: {
        mountPoint: 'custom-mount'
      }
    })

    fastify.register(plugin)
    await fastify.ready()

    t.assert.equal(fastify.secrets.dbPassword, 'database.password', 'decorates Fastify with the secret')
    t.assert.equal(typeof fastify.secrets.refresh, 'function', 'exposes the refresh function')
    t.assert.deepStrictEqual(StubClient.instances.at(-1).options, { mountPoint: 'custom-mount' })
  })

  await t.test('registers with a namespace and refresh alias', async (t) => {
    const fastify = Fastify({ logger: false })
    t.after(() => fastify.close())

    const plugin = createHashiCorpSecretsPlugin({
      namespace: 'database',
      refreshAlias: 'reload',
      secrets: { password: { name: 'credentials', key: 'password' } }
    })

    fastify.register(plugin)
    await fastify.ready()

    t.assert.equal(fastify.secrets.database.password, 'credentials.password')
    t.assert.equal(typeof fastify.secrets.database.reload, 'function')
    t.assert.equal(fastify.secrets.refresh, undefined, 'does not add refresh at the root')
  })
})
