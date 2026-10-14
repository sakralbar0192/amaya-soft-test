// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },
  app: {
    baseURL: '/paywall/',
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
