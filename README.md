# Fastify Secrets HashiCorp

![CI](https://github.com/nearform/fastify-secrets-hashicorp/workflows/CI/badge.svg)

Fastify secrets plugin for [HashiCorp Vault](https://www.vaultproject.io). The plugin supports both [KV Secrets Engine - Version 2](https://www.vaultproject.io/docs/secrets/kv/kv-v2) (default) and [KV Secrets Engine - Version 1](https://www.vaultproject.io/docs/secrets/kv/kv-v1) (need to enable via [useKVv1](#clientoptionsusekvv1) flag).

## Installation

```sh
npm install --save fastify-secrets-hashicorp
```

## Usage

```js
const Fastify = require('fastify')
const FastifySecretsHashiCorp = require('fastify-secrets-hashicorp')

const fastify = Fastify()

// Add plugin to your fastify instance
fastify.register(FastifySecretsHashiCorp, {
  secrets: {
    dbPassword: {
      name: 'secret-name',
      key: 'value'
    }
  },
  clientOptions: {
    vaultOptions: {
      token: 'example-token',
      endpoint: 'http://127.0.0.1:8200'
    },
    mountPoint: 'example-mount'
  }
})

// Access your secrets
fastify.ready().then(() => {
  console.log(fastify.secrets.dbPassword) // content of 'example-mount/secret-name'
})
```

### Plugin options

Assuming a secret has been written [using the vault CLI](https://www.vaultproject.io/docs/commands/write#examples) like this:

```sh
VAULT_ADDR='http://127.0.0.1:8200' vault write myproject/database password=mysecret
```

The plugin can be initialised to read this secret as follows:

```js
fastify.register(FastifySecretsHashiCorp, {
  secrets: {
    dbPassword: {
      name: 'database',
      key: 'password'
    }
  },
  clientOptions: {
    vaultOptions: {
      token: '<TOKEN>',
      endpoint: 'http://127.0.0.1:8200'
    },
    mountPoint: 'myproject'
  }
})
```

#### clientOptions.mountPoint

The [path to the secrets engine](https://www.vaultproject.io/docs/secrets#secrets-engines-lifecycle). Defaults to 'secret'.

#### clientOptions.useKVv1

If this flag is set to `true`, will read from the Vault using [KV Secrets Engine - Version 1](https://www.vaultproject.io/docs/secrets/kv/kv-v1). Defaults to `false`.
How to use the plugin with kv-v1:

```js
fastify.register(FastifySecretsHashiCorp, {
  secrets: {
    dbPassword: {
      name: 'database',
      key: 'password'
    }
  },
  clientOptions: {
    vaultOptions: {
      token: '<TOKEN>',
      endpoint: 'http://127.0.0.1:8200'
    },
    mountPoint: 'myproject',
    useKVv1: true
  }
})
```
#### clientOptions.vaultOptions

Initialisation options that are sent to [node-vault](https://github.com/kr1sp1n/node-vault), typed as [VaultOptions](https://github.com/kr1sp1n/node-vault/blob/70097269d35a58bb560b5290190093def96c87b1/index.d.ts#L115-L130).

The most important being:

- vaultOptions.token: Vault access token. Defaults to process.env.VAULT_TOKEN.
- vaultOptions.endpoint: Endpoint to the Vault API. Defaults to process.env.VAULT_ADDR else 'http://127.0.0.1:8200'

### Assumptions

- A vault server is running and [has been unsealed](https://www.vaultproject.io/docs/concepts/seal)
- A secrets engine is available at `secrets/` (or at the provided mountPoint in options) and us using either [KV Secrets Engine - Version 2](https://www.vaultproject.io/docs/secrets/kv/kv-v2) or [KV Secrets Engine - Version 1](https://www.vaultproject.io/docs/secrets/kv/kv-v1) (with `useKVv1` option set to `true`)
- clientOptions.vaultOptions.token is provided as an option, or VAULT_TOKEN is available as an environment variable
- clientOptions.vaultOptions.endpoint is provided as an option, or VAULT_ADDR is available as an environment variable

### Secrets Engine

We assume that the [kv-v2](https://www.vaultproject.io/docs/secrets/kv/kv-v2) secrets engine is being used. If vault is started in dev mode (`vault server -dev`) it defaults to the kv-v2 engine, mounted at `secrets/`. In order to use the dev server, with kv-v1, you need to remove it and mount a kv-v1 secrets provider instead:

```sh
VAULT_ADDR='http://127.0.0.1:8200' vault secrets disable secret
VAULT_ADDR='http://127.0.0.1:8200' vault secrets enable -version=1 -path=secret kv
```

Or alternatively, mount kvv1 on a different path, without removing the kv-v2 engine.

```sh
VAULT_ADDR='http://127.0.0.1:8200' vault secrets enable -version=1 -path=kvv1 kv
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2021. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).
