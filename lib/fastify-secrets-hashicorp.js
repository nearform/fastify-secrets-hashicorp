'use strict'

const { buildPlugin } = require('fastify-secrets-core')

const HashiCorpClient = require('./client')

const kInferred = Symbol.for('fastify-secrets-hashicorp.inferred')

const defaultPlugin = buildPlugin(HashiCorpClient, {
  name: 'fastify-secrets-hashicorp'
})

function createHashiCorpSecretsPlugin(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('fastify-secrets-hashicorp: options object is required')
  }

  if (!options.secrets || typeof options.secrets !== 'object' || Object.keys(options.secrets).length === 0) {
    throw new Error('fastify-secrets-hashicorp: options.secrets must be a non-empty object')
  }

  const inferred = {}
  for (const key of Object.keys(options.secrets)) {
    inferred[key] = true
  }

  const plugin = buildPlugin(HashiCorpClient, {
    name: 'fastify-secrets-hashicorp'
  })
  plugin[kInferred] = inferred

  return plugin
}

module.exports = defaultPlugin
module.exports.default = defaultPlugin
module.exports.createHashiCorpSecretsPlugin = createHashiCorpSecretsPlugin
module.exports.kInferred = kInferred
