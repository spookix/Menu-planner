// plugins/00-vuetify.js
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    defaults: { VBtn: { rounded: 'xl' }, VCard: { rounded: 'xl' } },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: { colors: { primary: '#1e88e5' } },
        dark:  { colors: { primary: '#82b1ff' } },
      },
    },
    display: { mobileBreakpoint: 'sm' },
  })
  nuxtApp.vueApp.use(vuetify)
})
