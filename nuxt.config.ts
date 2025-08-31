import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
  //...
  //srcDir: 'app',
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css'],
  build: { transpile: ['vuetify'] },
  vite: { 
    ssr: { noExternal: ['vuetify'] }, 
    define: { 'process.env.DEBUG': false },
    plugins: [vuetify({ autoImport: true })]
  },
  typescript: { typeCheck: false, tsConfig: { references: [] } }, // pas de refs cassées
  app: { head: { meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }] } },
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  modules: ['@pinia/nuxt'],
})
