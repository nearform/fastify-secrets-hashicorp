import type { FastifyPluginAsync } from 'fastify'
import type NodeVault = require('node-vault')

/**
 * Shared symbol used by `createHashiCorpSecretsPlugin` to attach the
 * captured secret keys to the returned plugin.
 *
 * Declared here as a `unique symbol` so it can be used both as a property
 * key in the type system and (when re-exported as a value) as the
 * `Symbol.for('fastify-secrets-hashicorp.inferred')` reference at runtime.
 */
export const kInferred: unique symbol

/** Options for the underlying `node-vault` client. */
type VaultOptions = NodeVault.VaultOptions

/**
 * Reference to a single secret stored in HashiCorp Vault.
 *
 * Matches the shape consumed by `HashiCorpClient#get` in `lib/client.js`.
 */
interface HashiCorpSecretReference {
  /**
   * The Vault secret name (i.e. the path under the mount point).
   */
  name: string

  /**
   * The key inside the secret payload to read. Defaults to `'value'`.
   */
  key?: string
}

/**
 * Options forwarded to the `HashiCorpClient` constructor.
 *
 * Mirrors the destructuring performed in `lib/client.js:10`.
 */
interface HashiCorpClientOptions {
  /**
   * Mount point of the KV secrets engine. Defaults to `'secret'`.
   */
  mountPoint?: string

  /**
   * Read from KV Secrets Engine v1 instead of v2. Defaults to `false`.
   */
  useKVv1?: boolean

  /**
   * Options forwarded to `node-vault`.
   */
  vaultOptions?: VaultOptions
}

/** Map of secret names to HashiCorp Vault references. */
type HashiCorpSecretReferences = Record<string, HashiCorpSecretReference>

/** Values returned by a refresh operation. */
type SecretValues = Record<string, string | undefined>

/** Refresh all secrets, or only the supplied secret-reference map. */
type Refresh = (refs?: HashiCorpSecretReferences) => Promise<SecretValues>

/**
 * Shape stored below a configured namespace.
 *
 * The named `refresh` member is optional because `refreshAlias` can rename
 * it. Dynamic aliases are represented by the index signature.
 */
interface SecretsNamespace {
  refresh?: Refresh
  [key: string]: string | Refresh | undefined
}

/**
 * Shape of `fastify.secrets` after registration.
 *
 * Fastify's global module augmentation cannot infer whether any particular
 * registration uses a namespace, so dynamic keys can contain either a
 * string secret value or a namespaced container. The default `refresh`
 * member is optional because namespaced registrations place it below the
 * namespace and `refreshAlias` can rename it.
 */
interface SecretsShape {
  refresh?: Refresh
  [key: string]: string | Refresh | SecretsNamespace | undefined
}

/**
 * Plugin registration options.
 *
 * Mirrors the documented `fastify-secrets-core` plugin options.
 */
interface Options {
  /**
   * Object mapping user-defined secret names to their Vault references.
   */
  secrets: HashiCorpSecretReferences

  /**
   * Options forwarded to the underlying `HashiCorpClient`.
   */
  clientOptions?: HashiCorpClientOptions

  /**
   * Place secrets under `fastify.secrets[namespace]` instead of
   * `fastify.secrets`.
   */
  namespace?: string

  /**
   * Number of parallel `client.get` calls. Defaults to `5`.
   */
  concurrency?: number

  /**
   * Rename the `refresh` method (e.g. to avoid clashes with a secret name).
   */
  refreshAlias?: string
}

/**
 * Augments the Fastify instance with the `secrets` decorator.
 */
declare module 'fastify' {
  interface FastifyInstance {
    secrets: SecretsShape
  }
}

declare const fastifySecretsHashiCorp: FastifyPluginAsync<Options>

declare namespace fastifySecretsHashiCorp {
  export {
    HashiCorpSecretReference,
    HashiCorpSecretReferences,
    HashiCorpClientOptions,
    Options,
    Refresh,
    SecretValues,
    SecretsNamespace,
    SecretsShape,
    VaultOptions
  }
}

/**
 * Create a HashiCorp secrets plugin instance from explicit options.
 *
 * At runtime this captures the keys of the `secrets` option, validates that
 * it is a non-empty object, and returns a `fastify-plugin`-wrapped plugin
 * function with the captured keys attached on the shared `kInferred` symbol.
 *
 * The returned plugin function is functionally identical to the default
 * export.
 *
 * Note: this factory does not narrow `fastify.secrets` after registration —
 * Fastify's `register()` typing returns the same `FastifyInstance`
 * regardless of plugin return type.
 */
export function createHashiCorpSecretsPlugin<SecretsT extends Record<string, HashiCorpSecretReference>>(
  options: Options & { secrets: SecretsT }
): FastifyPluginAsync & {
  readonly [kInferred]: { [K in keyof SecretsT]: true }
}

export type {
  Options,
  HashiCorpSecretReference,
  HashiCorpSecretReferences,
  HashiCorpClientOptions,
  Refresh,
  SecretValues,
  SecretsNamespace,
  SecretsShape,
  VaultOptions
}
export default fastifySecretsHashiCorp
