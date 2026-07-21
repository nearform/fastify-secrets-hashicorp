import fastifySecretsHashiCorp, {
  createHashiCorpSecretsPlugin,
  kInferred
} from './index.js'
import { describe, expect, test } from 'tstyche'
import fastify, { type FastifyInstance } from 'fastify'

function withServer(
  runAssertions: (server: FastifyInstance) => void,
  options: fastifySecretsHashiCorp.Options = {
    secrets: { dbPassword: { name: 'database', key: 'password' } }
  }
): void {
  const server = fastify()
  server.register(fastifySecretsHashiCorp, options)
  server.after(() => runAssertions(server))
}

describe('fastify-secrets-hashicorp', () => {
  describe('default export', () => {
    test('registers via the default export', () => {
      withServer(() => {})
    })

    test('secrets is typed as Record<string, string | undefined>', () => {
      withServer((server) => {
        expect(server.secrets).type.toBe<fastifySecretsHashiCorp.SecretsShape>()
      })
    })

    test('accepts the full clientOptions shape', () => {
      withServer(() => {}, {
        secrets: {
          dbPassword: { name: 'database', key: 'password' }
        },
        clientOptions: {
          mountPoint: 'myproject',
          useKVv1: true,
          vaultOptions: {
            endpoint: 'http://127.0.0.1:8200',
            token: 'example-token'
          }
        }
      })
    })

    test('accepts a namespace', () => {
      withServer(() => {}, {
        namespace: 'db',
        secrets: {
          password: { name: 'database', key: 'password' }
        }
      })
    })

    test('accepts concurrency and refreshAlias', () => {
      withServer(() => {}, {
        secrets: { token: { name: 'api', key: 'value' } },
        concurrency: 1,
        refreshAlias: 'update'
      })
    })
  })

  describe('createHashiCorpSecretsPlugin factory', () => {
    test('returns a registerable plugin function', () => {
      const server = fastify()
      const plugin = createHashiCorpSecretsPlugin({
        secrets: {
          dbPassword: { name: 'database', key: 'password' }
        }
      })

      expect(plugin).type.toBeAssignableTo<Parameters<typeof server.register>[0]>()
    })

    test('attaches captured keys on the kInferred symbol', () => {
      const plugin = createHashiCorpSecretsPlugin({
        secrets: {
          dbPassword: { name: 'database', key: 'password' },
          apiToken: { name: 'api', key: 'token' }
        }
      })

      expect(plugin[kInferred]).type.toBe<{ dbPassword: true; apiToken: true } | undefined>()
    })

    test('captures a single key on the kInferred symbol', () => {
      const plugin = createHashiCorpSecretsPlugin({
        secrets: {
          onlyOne: { name: 'one' }
        }
      })

      expect(plugin[kInferred]).type.toBe<{ onlyOne: true } | undefined>()
    })

    test('accepts the full clientOptions shape', () => {
      const server = fastify()
      const plugin = createHashiCorpSecretsPlugin({
        secrets: {
          password: { name: 'database', key: 'password' }
        },
        clientOptions: {
          mountPoint: 'myproject',
          useKVv1: false,
          vaultOptions: {
            endpoint: 'http://127.0.0.1:8200'
          }
        }
      })

      server.register(plugin)
      server.after(() => {
        expect(server.secrets).type.toBe<fastifySecretsHashiCorp.SecretsShape>()
      })
    })

    test('accepts a namespace', () => {
      const server = fastify()
      const plugin = createHashiCorpSecretsPlugin({
        namespace: 'db',
        secrets: {
          password: { name: 'database', key: 'password' }
        }
      })

      server.register(plugin)
      server.after(() => {
        expect(server.secrets).type.toBe<fastifySecretsHashiCorp.SecretsShape>()
      })
    })
  })
})