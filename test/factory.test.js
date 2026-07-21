'use strict'

const { test } = require('node:test')

const Fastify = require('fastify')

const { createHashiCorpSecretsPlugin, kInferred } = require('..')

test('createHashiCorpSecretsPlugin', async (t) => {
  await t.test('returns a plugin function with kInferred marker', (t) => {
    const plugin = createHashiCorpSecretsPlugin({
      secrets: {
        dbPassword: { name: 'database', key: 'password' },
        apiToken: { name: 'api', key: 'token' }
      }
    })

    t.assert.equal(typeof plugin, 'function', 'returns a function')
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

  await t.test('returns a plugin that registers on a Fastify instance', async (t) => {
    const fastify = Fastify({ logger: false })
    const plugin = createHashiCorpSecretsPlugin({
      secrets: { dbPassword: { name: 'database', key: 'password' } },
      clientOptions: {
        vaultOptions: { endpoint: 'http://127.0.0.1:8200' }
      }
    })

    t.assert.doesNotThrow(() => fastify.register(plugin), 'accepts register()')

    await fastify.close()
  })
})
