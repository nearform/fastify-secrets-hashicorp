# Fastify Secrets HashiCorp

![CI](https://github.com/nearform/fastify-secrets-hashicorp/workflows/CI/badge.svg)

Fastify secrets plugin for [HashiCorp Vault](https://www.vaultproject.io).

## Installation

```sh
npm install --save fastify-secrets-hashicorp
```

## Usage

### Add plugin to your fastify instance

```js
fastify.register(FastifySecretsHashiCorp, {
  secrets: {
    dbPassword: 'secret-name'
  }
})
```

### Access your secrets

```js
await fastify.ready()

console.log(fastify.secrets.dbPassword) // content of 'secret-name'
```

### Plugin options

The plugin can be initialised with clientOptions as follows:

```js
fastify.register(FastifySecretsHashiCorp, {
  secrets: {
    dbPassword: 'secret-name'
  },
  clientOptions: {
  }
})
```

Following the structure

```js
clientOptions: {
    vaultOptions: {
      token: '', 
      endpoint: ''
    },
    mountPoint, ''
  }
```

#### clientOptions.mountPoint

The [path to the secrets engine](https://www.vaultproject.io/docs/secrets#secrets-engines-lifecycle). Defaults to 'secret'.

#### clientOptions.vaultOptions

Initialisation options that are sent to [node-vault](https://github.com/kr1sp1n/node-vault), typed as [VaultOptions](https://github.com/kr1sp1n/node-vault/blob/70097269d35a58bb560b5290190093def96c87b1/index.d.ts#L115-L130).

The most important being:

- vaultOptions.token: Vault access token. Defaults to process.env.VAULT_TOKEN.
- vaultOptions.endpoint: Endpoint to the Vault API. Defaults to process.env.VAULT_ADDR else 'http://127.0.0.1:8200'

### Assumptions

- The vault is unsealed
- The secrets engine is [kv-v1](https://www.vaultproject.io/docs/secrets/kv/kv-v1)
 (see below)
- VAULT_TOKEN is available as an environment variable, or passed in to clientOptions.vaultOptions.token
- VAULT_ADDR is available as an environment variable, or passed in to clientOptions.vaultOptions.endpoint

### Secrets Engine

We assume that the kv-v1 secrets engine is being used. If vault is started in dev mode (`vault server -dev`) it defaults to the kv-v2 engine, mounted at `secrets/`. In order to use the dev server, we need to remove it and mount a kv-v1 secrets provider instead:

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