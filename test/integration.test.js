'use strict'

const { test, teardown } = require('tap')
const uuid = require('uuid')
const Fastify = require('fastify')
const nodeVault = require('./../../node-vault/src/index')

const FastifySecretsHashiCorp = require('..')

const SECRET_KEY = 'exampleKey'
const SECRET_NAME = uuid.v4()
const SECRET_CONTENT = uuid.v4()
const MOUNT_POINT = 'fastify-integration-test'
const vault = nodeVault()

async function setup() {
  await vault.mount({ mount_point: MOUNT_POINT, type: 'kv', options: { version: 1 } })
  await vault.write(`${MOUNT_POINT}/${SECRET_NAME}`, { [SECRET_KEY]: SECRET_CONTENT })
}

teardown(async () => {
  await vault.delete(`${MOUNT_POINT}/${SECRET_NAME}`)
  await vault.unmount({ mount_point: MOUNT_POINT })
})

test('integration', async (t) => {
  t.plan(1)
  await setup()

  const fastify = Fastify({
    logger: process.env.TEST_LOGGER || false
  })

  fastify.register(FastifySecretsHashiCorp, {
    secrets: {
      test: {
        name: SECRET_NAME,
        key: SECRET_KEY
      }
    },
    clientOptions: {
      vaultOptions: {
        endpoint: 'http://127.0.0.1:8200'
      },
      mountPoint: MOUNT_POINT,
      useKVv1: true,
    }
  })

  await fastify.ready()

  t.same(
    fastify.secrets,
    {
      test: SECRET_CONTENT
    },
    'decorates fastify with secret content'
  )
})
