// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.vibma/**'],
  },
  {
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': ['error', 2],
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
)
