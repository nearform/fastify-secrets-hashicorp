'use strict'

const nodeVault = require('node-vault')

class HashiCorpClient {
  /**
   * @param options {{mountPoint?: string, vaultOptions: import("node-vault").VaultOptions}}
   */
  constructor(options = {}) {
    const { mountPoint = 'secret', vaultOptions } = options
    this.mountPoint = mountPoint
    this.vault = nodeVault(vaultOptions)
  }

  async get(secret) {
    const { name, key = 'value' } = secret
    try {
      const response = await this.vault.read(`${this.mountPoint}/${name}`)
      return response.data[key]
    } catch (err) {
      throw new Error(`Secret not found: ${name}.${key}`)
    }
  }
}

module.exports = HashiCorpClient
