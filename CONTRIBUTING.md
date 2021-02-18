# Welcome to Fastify Secrets HashiCorp

Please take a second to read over this before opening an issue. Providing complete information upfront will help us address any issue (and ship new features!) faster.

We greatly appreciate bug fixes, documentation improvements and new features, however when contributing a new major feature, it is a good idea to idea to first open an issue, to make sure the feature it fits with the goal of the project, so we don't waste your or our time.

## Bug Reports

A perfect bug report would have the following:

1. Summary of the issue you are experiencing.
2. Details on what versions of node, fastify-secrets-core and fastify-secrets-hashicorp you are using (`node -v`).
3. A simple repeatable test case for us to run. Please try to run through it 2-3 times to ensure it is completely repeatable.

We would like to avoid issues that require a follow up questions to identify the bug. These follow ups are difficult to do unless we have a repeatable test case.

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
