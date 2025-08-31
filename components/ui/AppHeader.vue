<template>
  <v-app-bar app elevation="2" color="surface" class="app-header">
    <v-container class="d-flex align-center">
      <div class="d-flex align-center">
        <v-icon size="32" color="primary" class="mr-3">mdi-food</v-icon>
        <h1 class="text-h5 font-weight-bold text-primary mb-0">Menu Planner</h1>
      </div>

      <v-spacer />

      <div class="d-flex align-center gap-3">
        <!-- Utilisateur connecté -->
        <div v-if="auth.isAuthenticated" class="d-flex align-center gap-2">
          <v-avatar size="32" color="primary">
            <span class="text-caption font-weight-bold text-white">
              {{ auth.username?.charAt(0).toUpperCase() || 'U' }}
            </span>
          </v-avatar>
          
          <span class="text-body-2 font-weight-medium text-medium-emphasis">
            {{ auth.username || 'Utilisateur' }}
          </span>

          <v-btn
            icon
            variant="text"
            size="small"
            @click="auth.signOut()"
            class="ml-2"
          >
            <v-icon size="20">mdi-logout</v-icon>
          </v-btn>
        </div>

        <!-- Bouton de connexion -->
        <v-btn
          v-else
          color="primary"
          variant="tonal"
          prepend-icon="mdi-login"
          @click="$router.push('/auth')"
          rounded="lg"
        >
          Se connecter
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid #e9ecef;
}

.text-primary {
  color: #007bff !important;
}
</style>
