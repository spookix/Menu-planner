<template>
  <div>
    <div v-if="auth.loading" class="d-flex justify-center align-center" style="height: 200px;">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>
    
    <div v-else-if="!auth.isAuthenticated" class="auth-required">
      <div class="text-center py-8">
        <v-icon size="64" color="primary" class="mb-4">mdi-lock</v-icon>
        <h3 class="text-h5 font-weight-medium mb-2">Authentification requise</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          Vous devez être connecté pour accéder à  cette page
        </p>
        <v-btn
          color="primary"
          size="large"
          rounded="lg"
          @click="$router.push('/auth')"
        >
          <v-icon start class="mr-2">mdi-login</v-icon>
          Se connecter
        </v-btn>
      </div>
    </div>
    
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.auth-required {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

