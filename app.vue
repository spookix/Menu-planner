<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <Analytics />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html, body { background: var(--v-theme-background); }
.v-container { max-width: 720px; }
/* Global layout variables */
:root {
  --header-height: 64px;
  --bottom-nav-height: 80px;
}
</style>
