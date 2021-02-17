# Welcome to Fastify Secrets Vault

## For Developers

All contributions should fit the linter, pass the tests and add new tests when new features are added. You can test this by running

```sh
npm run lint
npm run test
```

In order to run the tests you will need a Vault server running locally:

- [Install Vault](https://learn.hashicorp.com/tutorials/vault/getting-started-install#install-vault)
  - e.g. from a Mac this can be done with homebrew

```sh
brew tap hashicorp/tap
brew install hashicorp/tap/vault
```

- Open a new terminal window and launch a Vault server in dev mode
  - `vault server -dev` (make a note of the Root Token for the next step)
- Open another terminal window and set the secrets mode to v1

```sh
VAULT_ADDR='http://127.0.0.1:8200' vault secrets disable secret
VAULT_ADDR='http://127.0.0.1:8200' vault secrets enable -version=1 -path=secret -description='local secrets' kv
```

- finally, run the tests

```sh
VAULT_TOKEN=<Root Token> npm test
```
