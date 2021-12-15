'use strict'

const { test, teardown } = require('tap')
const uuid = require('uuid')
const Fastify = require('fastify')
const nodeVault = require('node-vault')

const FastifySecretsHashiCorp = require('..')

const SECRET_KEY = 'exampleKey'
const SECRET_NAME = uuid.v4()
const SECRET_CONTENT = uuid.v4()
const MOUNT_POINT = {
  V1: 'fastify-integration-test_v1',
  V2: 'fastify-integration-test_v2'
}
const VERSIONS = {
  V1: 1,
  V2: 2
}
const vault = nodeVault()

async function setup(version) {
  await vault.mount({ mount_point: MOUNT_POINT[version], type: 'kv', options: { version: VERSIONS[version] } })

  let path = `${MOUNT_POINT.V1}/${SECRET_NAME}`
  let data = { [SECRET_KEY]: SECRET_CONTENT }

  if (version === 'V2') {
    path = `${MOUNT_POINT.V2}/data/${SECRET_NAME}`
    data = { data: { [SECRET_KEY]: SECRET_CONTENT } }
  }

  await vault.write(path, data)
}

async function cleanup(version) {
  const path =
    version === 'V1' ? `${MOUNT_POINT[version]}/${SECRET_NAME}` : `${MOUNT_POINT[version]}/metadata/${SECRET_NAME}`
  await vault.delete(path)
  await vault.unmount({ mount_point: MOUNT_POINT[version] })
}

teardown(async () => {
  await cleanup('V1')
  await cleanup('V2')
})

test('integration v1', async (t) => {
  t.plan(1)
  await setup('V1')

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
      mountPoint: MOUNT_POINT.V1,
      useKVv1: true
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

test('integration v2', async (t) => {
  t.plan(1)
  await setup('V2')

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
      mountPoint: MOUNT_POINT.V2
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
