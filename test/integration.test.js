'use strict'

const { test, teardown } = require('tap')
const uuid = require('uuid')
const Fastify = require('fastify')
const nodeVault = require('node-vault')

const FastifySecretsVault = require('../')

const SECRET_NAME = `secret/helloworld`
const SECRET_CONTENT = uuid.v4()

const vault = nodeVault()

async function createSecret() {
  return await vault.write(SECRET_NAME, { value: SECRET_CONTENT, lease: '1s' })
}

teardown(function deleteSecret() {
  return vault.delete(SECRET_NAME)
})

test('integration', async (t) => {
  t.plan(1)

  await createSecret()

  const fastify = Fastify({
    logger: process.env.TEST_LOGGER || false
  })

  fastify.register(FastifySecretsVault, {
    secrets: {
      test: SECRET_NAME
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
