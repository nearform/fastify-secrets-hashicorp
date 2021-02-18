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
    test: SECRET_NAME
  },
  clientOptions: {
    vaultOptions: {
      token: 'XXX', //defaults to process.env.VAULT_TOKEN
      endpoint: 'http://127.0.0.1:8200'
    },
    mountPoint: 'secret' // default
  }
})
```

See Options

### Access you secrets

```js
await fastify.ready()

console.log(fastify.secrets.dbPassword) // content of 'secret-name'
```

### Plugin options

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

#### clientOptions

- mountPoint: defaults to 'secret'

##### vaultOptions

- token: defaults to process.env.VAULT_TOKEN
- endpoint: defaults to process.env.VAULT_ADDR else 'http://127.0.0.1:8200'

### Assumptions

- The vault is unsealed
- VAULT_TOKEN is available as an environment variable, or passed in to clientOptions.vaultOptions.token
- VAULT_ADDR is available as an environment variable, or passed in to clientOptions.vaultOptions.endpoint

### Secrets Engine

The kv-v1 secrets engine is currently supported. If you start vault in dev mode (`vault server -dev`) it uses the mounts the `kv-v2` engine at `secrets/` - to be able to use this, we need to remove it and mount a ky-v1 secrets provider instead:

```sh
VAULT_ADDR='http://127.0.0.1:8200' vault secrets disable secret
VAULT_ADDR='http://127.0.0.1:8200' vault secrets enable -version=1 -path=secret kv
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2021. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).