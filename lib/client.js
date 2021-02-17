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
      const response = await this.vault.read(name)
      return response.data.value
    } catch (err) {
      throw new Error(`Secret not found: ${name}`)
    }
  }
}

module.exports = VaultClient
