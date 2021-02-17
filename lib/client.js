'use strict'

const nodeVault = require('node-vault')

class VaultClient {
  /**
   * @param options {import("node-vault").VaultOptions}
   */
  constructor(options) {
    this.vault = nodeVault(options)
  }

  async get(name) {
    try {
      return await this.vault.read(name).promise()
    } catch (err) {
      throw new Error(`Secret not found: ${name}`)
    }
  }
}

module.exports = VaultClient
