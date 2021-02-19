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

  async get(name) {
    try {
      const response = await this.vault.read(`${this.mountPoint}/${name}`)
      return response.data.value
    } catch (err) {
      throw new Error(`Secret not found: ${name}`)
    }
  }
}

module.exports = HashiCorpClient
