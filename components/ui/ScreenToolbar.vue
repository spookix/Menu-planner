<template>
    <v-app-bar flat height="56" class="px-2">
      <v-btn icon to="/" v-if="showBack"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-toolbar-title class="text-h6">{{ title }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="toggle"><v-icon>mdi-theme-light-dark</v-icon></v-btn>
    </v-app-bar>
  </template>
  
  <script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { useTheme } from 'vuetify'
  const route = useRoute()
  const title = computed(() => {
    const map: Record<string,string> = {
      '/planner': 'Meal Planner',
      '/recipes': 'Recipe Search',
      '/grocery': 'Shopping List',
      '/history': 'History',
      '/profile': 'Profile'
    }
    return map[route.path] || 'Recipe Details'
  })
  const showBack = computed(() => route.path.startsWith('/recipes/') )
  const theme = useTheme()
  const toggle = () => theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  </script>
  