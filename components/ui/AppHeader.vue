<template>
  <v-app-bar app elevation="2" color="surface" class="app-header">
    <v-container class="d-flex align-center">
      <NuxtLink to="/" aria-label="Aller � l'accueil" class="d-flex align-center header-home-link">
        <v-icon size="32" color="primary" class="mr-3">mdi-food</v-icon>
        <h1 class="text-h5 font-weight-bold text-primary mb-0">Menu Planner</h1>
      </NuxtLink>

      <v-spacer />

      <div class="d-flex align-center gap-3">
        <!-- Utilisateur connect� -->
        <div v-if="auth.isAuthenticated" class="d-flex align-center gap-2">
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <button v-bind="props" class="user-trigger">
                <v-avatar size="32" color="primary">
                  <span class="text-caption font-weight-bold text-white">
                    {{ auth.username?.charAt(0).toUpperCase() || 'U' }}
                  </span>
                </v-avatar>
                <span class="text-body-2 font-weight-medium text-medium-emphasis ml-2">
                  {{ auth.username || 'Utilisateur' }}
                </span>
                <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
              </button>
            </template>
            <v-list density="compact">
              <v-list-subheader>Mon compte</v-list-subheader>
              <v-list-item @click="openPickOwner = true">
                <template #prepend><v-icon size="18">mdi-calendar-account</v-icon></template>
                <v-list-item-title>Changer de planning</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openShare = true">
                <template #prepend><v-icon size="18">mdi-share-variant</v-icon></template>
                <v-list-item-title>Partager mon planning</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1" />
              <v-list-item @click="auth.signOut()">
                <template #prepend><v-icon size="18">mdi-logout</v-icon></template>
                <v-list-item-title>Se déconnecter</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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
  <SharePlanningDialog v-model="openShare" />
  <PlanOwnerPickerDialog v-model="openPickOwner" />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { ref, onMounted } from 'vue'
import { usePlannerStore } from '~/stores/planner'
import SharePlanningDialog from '~/components/planner/SharePlanningDialog.vue'
import PlanOwnerPickerDialog from '~/components/planner/PlanOwnerPickerDialog.vue'

const auth = useAuthStore()
const planner = usePlannerStore()
const openShare = ref(false)
const openPickOwner = ref(false)

onMounted(() => {
  planner.initOwnerContext()
})
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid #e9ecef;
}

.text-primary {
  color: #007bff !important;
}

.header-home-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.user-trigger { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 0; padding: 4px 6px; cursor: pointer; }
</style>



