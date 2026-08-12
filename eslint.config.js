const globals = require('globals')
const js = require('@eslint/js')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const importPlugin = require('eslint-plugin-import-x')

module.exports = [
    js.configs.recommended,
    prettierRecommended,
    importPlugin.flatConfigs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node
            },
            ecmaVersion: 'latest',
            sourceType: 'module'
        }
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            "import-x/order": [
                "error",
                {
                    "newlines-between": "always"
                }
            ]
        },
    },
]