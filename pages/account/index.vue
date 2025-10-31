<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold">Mon compte</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>
            <v-text-field
              v-model="username"
              label="Nom visible"
              :disabled="loading"
              :rules="[v => !!v || 'Requis', v => v.length >= 3 || 'Minimum 3 caractères']"
              counter="50"
              prepend-inner-icon="mdi-account"
            />
            <div v-if="redirectIn !== null" class="mt-2 text-medium-emphasis text-caption">
              Redirection dans {{ redirectIn }}s…
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" :disabled="loading" @click="reset">Annuler</v-btn>
            <v-btn color="primary" :loading="loading" @click="save">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)
const ui = useUiStore()
const router = useRouter()
let redirectTimer: any = null
let countdownTimer: any = null
const redirectIn = ref<number | null>(null)

const fallbackName = computed(() => auth.username || (auth.userEmail?.split('@')[0] || 'Utilisateur'))
const username = ref('')

const hydrate = () => {
  username.value = fallbackName.value
}

const reset = () => {
  // Annuler et revenir à la page précédente
  if (redirectTimer) clearTimeout(redirectTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  router.back()
}

const save = async () => {
  error.value = null
  const name = username.value.trim()
  if (!name) { error.value = 'Nom requis'; return }
  try {
    loading.value = true
    await auth.updateProfile({ username: name, full_name: name })
    // Déterminer le nom français de la page précédente
    const prevPath: string | undefined = (window.history.state && (window.history.state as any).back) || undefined
    const toTitle = (path?: string | null): string => {
      if (!path) return 'la page précédente'
      try {
        const u = new URL(path, window.location.origin)
        const p = u.pathname.replace(/\/$/, '')
        const map: Record<string, string> = {
          '': 'Accueil',
          '/': 'Accueil',
          '/recipes': 'Recettes',
          '/grocery': 'Liste de courses',
          '/planner': 'Planning',
          '/account': 'Mon compte'
        }
        if (map[p] ) return map[p]
        const seg = p.split('/').filter(Boolean).pop() || ''
        return seg.charAt(0).toUpperCase() + seg.slice(1)
      } catch { return 'la page précédente' }
    }
    const prevTitle = toTitle(prevPath)
    const noteId = ui.notify('Profil mis à jour', { color: 'success', timeout: 4000, subtext: `Vous serez redirigé vers ${prevTitle} dans 4s` })
    // Redirection vers la page précédente après 4 secondes
    if (redirectTimer) clearTimeout(redirectTimer)
    if (countdownTimer) clearInterval(countdownTimer)
    redirectIn.value = 4
    countdownTimer = setInterval(() => {
      if (redirectIn.value !== null) {
        redirectIn.value = Math.max(0, redirectIn.value - 1)
        ui.update(noteId, { subtext: `Vous serez redirigé vers ${prevTitle} dans ${redirectIn.value}s` })
        if (redirectIn.value === 0) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
    redirectTimer = setTimeout(() => {
      router.back()
    }, 4000)
  } catch (e: any) {
    error.value = e.message || 'Impossible de mettre à jour votre profil'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  hydrate()
})

onBeforeUnmount(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
</style>
