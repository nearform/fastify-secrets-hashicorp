const Fastify = require('fastify')
const FastifySecretsHashiCorp = require('./lib/fastify-secrets-hashicorp')

const fastify = Fastify()

// Add plugin to your fastify instance
fastify.register(FastifySecretsHashiCorp, {
  secrets: {
    dbPassword: {
      name: 'database',
      key: 'password'
    }
  },
  clientOptions: {
    vaultOptions: {
      token: 's.rLqBXimaNwQMuJ3gcXGEsDgx',
      endpoint: 'http://127.0.0.1:8200'
    },
    mountPoint: 'secret',
    useKVv1: false
  }
})

// Access your secrets
fastify.ready().then(() => {
  console.log(fastify.secrets.dbPassword) // content of 'example-mount/secret-name'
})
