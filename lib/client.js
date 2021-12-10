'use strict'

const nodeVault = require('node-vault')

class HashiCorpClient {
  /**
   * @param options {{mountPoint?: string, vaultOptions: import("node-vault").VaultOptions}}
   */
  constructor(options = {}) {
    const { mountPoint = 'secret', vaultOptions, useKVv1 } = options
    this.useKVv1 = useKVv1
    this.mountPoint = mountPoint
    this.vault = nodeVault(vaultOptions)
  }

  async get(secret) {
    const { name, key = 'value' } = secret
    try {
      const vaultPath = this.useKVv1 ? `${this.mountPoint}/${name}` : `${this.mountPoint}/data/${name}`
      const response = await this.vault.read(vaultPath)
      return this.useKVv1 ? response.data[key] : response.data.data[key]
    } catch (err) {
      throw new Error(`Secret not found: ${name}.${key}`)
    }
  }
}

module.exports = HashiCorpClient
