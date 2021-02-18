# Welcome to Fastify Secrets HashiCorp

## For Developers

All contributions should fit the linter, pass the tests and add new tests when new features are added. Linting can be checked by running

```sh
npm run lint
```

In order to run the tests you will need to [Install Vault](https://learn.hashicorp.com/tutorials/vault/getting-started-install#install-vault) and start a server in dev mode. On a Mac this can be done with homebrew

```sh
brew tap hashicorp/tap
brew install hashicorp/tap/vault
```

Open a new terminal window, then run

```sh
vault server -dev
```

Make a note of the Root Token and then run the tests as follows

```sh
VAULT_TOKEN=<Root Token> npm test
```
