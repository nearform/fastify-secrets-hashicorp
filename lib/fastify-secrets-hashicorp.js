'use strict'

const { buildPlugin } = require('fastify-secrets-core')

const HashiCorpClient = require('./client')

module.exports = buildPlugin(HashiCorpClient, {
  name: 'fastify-secrets-hashicorp'
})
