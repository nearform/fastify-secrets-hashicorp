'use strict'

const { test, teardown } = require('tap')
const uuid = require('uuid')
const Fastify = require('fastify')
const nodeVault = require('node-vault')

const FastifySecretsHashiCorp = require('../lib/fastify-secrets-hashicorp')

const SECRET_NAME = uuid.v4()
const SECRET_CONTENT = uuid.v4()
const vault = nodeVault()

async function setup() {
  await vault.mount({ mount_point: 'fastify-integration-test', type: 'kv', options: { version: 1 } })
  await vault.write(`fastify-integration-test/${SECRET_NAME}`, { value: SECRET_CONTENT, lease: '1s' })
}

teardown(async () => {
  await vault.delete(`fastify-integration-test/${SECRET_NAME}`)
  await vault.unmount({ mount_point: 'fastify-integration-test' })
})

test('integration', async (t) => {
  t.plan(1)
  await setup()

  const fastify = Fastify({
    logger: process.env.TEST_LOGGER || false
  })

  fastify.register(FastifySecretsHashiCorp, {
    secrets: {
      test: SECRET_NAME
    },
    clientOptions: {
      vaultOptions: {
        endpoint: 'http://127.0.0.1:8200'
      },
      mountPoint: 'fastify-integration-test'
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
