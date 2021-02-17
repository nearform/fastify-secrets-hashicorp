'use strict'

const { buildPlugin } = require('fastify-secrets-core')

const VaultClient = require('./client')

module.exports = buildPlugin(VaultClient, {
  name: 'fastify-secrets-vault'
})
