import type { FastifyPluginAsync, FastifyInstance } from 'fastify'

/**
 * Shared symbol used by `createHashiCorpSecretsPlugin` to attach the
 * captured secret keys to the returned plugin.
 *
 * Declared here as a `unique symbol` so it can be used both as a property
 * key in the type system and (when re-exported as a value) as the
 * `Symbol.for('fastify-secrets-hashicorp.inferred')` reference at runtime.
 */
export const kInferred: unique symbol

/**
 * Options for the underlying HashiCorp Vault client (node-vault).
 *
 * Re-declared locally because `node-vault` does not ship its own TypeScript
 * definitions. Mirrors `NodeVault.VaultOptions` from
 * https://github.com/kr1sp1n/node-vault/blob/main/index.d.ts
 */
interface VaultOptions {
  /**
   * Vault API version. Defaults to `'v1'` when not set.
   */
  apiVersion?: string

  /**
   * Vault endpoint. Defaults to `process.env.VAULT_ADDR` or
   * `'http://127.0.0.1:8200'`.
   */
  endpoint?: string

  /**
   * Vault namespace (Vault Enterprise).
   */
  namespace?: string

  /**
   * Path prefix appended to every request path.
   */
  pathPrefix?: string

  /**
   * Vault access token. Defaults to `process.env.VAULT_TOKEN`.
   */
  token?: string

  /**
   * Set to `true` to disable custom HTTP verbs (e.g. `LIST`).
   */
  noCustomHTTPVerbs?: boolean

  /**
   * Extra request options forwarded to the underlying HTTP client.
   */
  requestOptions?: Record<string, unknown>

  /**
   * Custom Promise implementation.
   */
  Promise?: PromiseConstructor

  /**
   * Custom logger; receives debug output.
   */
  debug?: (...args: unknown[]) => void
}

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

/**
 * Default shape of `fastify.secrets` after registration.
 *
 * Each entry is `string | undefined` because TypeScript's `Record` indexing
 * always allows `undefined`. At runtime the plugin populates each entry
 * before `ready()` resolves.
 */
type SecretsShape = Record<string, string | undefined>

/**
 * Plugin registration options.
 *
 * Mirrors the documented `fastify-secrets-core` plugin options.
 */
interface Options {
  /**
   * Object mapping user-defined secret names to their Vault references.
   */
  secrets?: Record<string, HashiCorpSecretReference>

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
    HashiCorpClientOptions,
    Options,
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
): FastifyPluginAsync<Options> & {
  readonly [kInferred]?: { [K in keyof SecretsT]: true }
}

export type {
  Options,
  HashiCorpSecretReference,
  HashiCorpClientOptions,
  SecretsShape,
  VaultOptions
}
export default fastifySecretsHashiCorp