<template>
  <v-app>
    <AppHeader />
    
    <v-main>
      <slot />
    </v-main>

    <BottomTabs />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  // Initialiser l'authentification au démarrage de l'app
  await auth.init()
})
</script>

<style>
.v-main {
  padding-top: 64px; /* Hauteur de l'en-tête */
  padding-bottom: 80px; /* Hauteur de la navigation du bas */
}
</style>
