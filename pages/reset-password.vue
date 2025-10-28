<template>
  <div class="reset-page">
    <v-container class="d-flex justify-center py-8">
      <v-card class="reset-card" max-width="480" rounded="xl" elevation="6">
        <v-card-title class="text-h6 font-weight-bold text-primary">
          Réinitialisation du mot de passe
        </v-card-title>
        <v-card-text>
          <template v-if="mode === 'request'">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
            <v-form ref="requestForm" @submit.prevent="sendResetEmail">
              <v-text-field v-model="email" label="Email" type="email" variant="outlined" rounded="lg" prepend-inner-icon="mdi-email" :rules="[rules.required, rules.email]" class="mb-4"/>
              <v-btn type="submit" color="primary" block rounded="lg" :loading="loading">Envoyer le lien</v-btn>
            </v-form>
            <v-alert v-if="message" type="success" variant="tonal" class="mt-4">{{ message }}</v-alert>
            <v-alert v-if="error" type="error" variant="tonal" class="mt-4">{{ error }}</v-alert>
          </template>

          <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-1">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
            <p v-if="userEmail" class="text-caption text-medium-emphasis mb-4">
              Compte: <strong>{{ userEmail }}</strong>
            </p>
            <v-form ref="updateForm" @submit.prevent="updatePassword">
              <v-text-field v-model="password" label="Nouveau mot de passe" type="password" variant="outlined" rounded="lg" prepend-inner-icon="mdi-lock" :rules="[rules.required, rules.min]" class="mb-3"/>
              <v-text-field v-model="password2" label="Confirmer le mot de passe" type="password" variant="outlined" rounded="lg" prepend-inner-icon="mdi-lock-check" :rules="[rules.required, rules.match]" class="mb-4"/>
              <v-btn type="submit" color="primary" block rounded="lg" :loading="loading">Mettre à jour le mot de passe</v-btn>
            </v-form>
            <v-alert v-if="message" type="success" variant="tonal" class="mt-4">{{ message }}</v-alert>
            <v-alert v-if="error" type="error" variant="tonal" class="mt-4">{{ error }}</v-alert>
          </template>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" color="primary" @click="navigateTo('/auth')">Retour à la connexion</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '~/lib/supabase'
import { useAuthStore } from '~/stores/auth'

type Mode = 'request' | 'update'
const auth = useAuthStore()
const route = useRoute()

const mode = ref<Mode>('request')
const email = ref('')
const password = ref('')
const password2 = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const userEmail = ref('')
const requestForm = ref()
const updateForm = ref()

const rules = {
  required: (v: string) => !!v || 'Champ requis',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email invalide',
  min: (v: string) => v.length >= 6 || 'Minimum 6 caractères',
  match: (v: string) => v === password.value || 'Les mots de passe ne correspondent pas'
}

onMounted(async () => {
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  // Lien Supabase sur Vercel arrive souvent sous forme de hash avec access_token
  if (hash && (hash.includes('access_token=') || hash.includes('type=recovery'))) {
    await initRecoverySessionFromURL(hash)
    mode.value = 'update'
  }

  // Support du lien avec paramètres de requête (?type=recovery&code=...&email=...)
  if (route.query && route.query.type === 'recovery' && typeof route.query.code === 'string') {
    await initRecoveryFromQuery()
    mode.value = 'update'
  }

  // Récupérer l'email de l'utilisateur si la session recovery est active
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email) userEmail.value = user.email

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
      mode.value = 'update'
      if (session?.user?.email) userEmail.value = session.user.email
    }
  })
})

// Initialise la session de récupération depuis les tokens du lien
async function initRecoverySessionFromURL(hash: string) {
  try {
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const access_token = params.get('access_token') || ''
    const refresh_token = params.get('refresh_token') || ''
    if (access_token && refresh_token) {
      const { data, error: sessErr } = await supabase.auth.setSession({ access_token, refresh_token })
      if (sessErr) throw sessErr
      if (data?.session?.user?.email) userEmail.value = data.session.user.email
    }
  } catch (e: any) {
    error.value = e.message || 'Lien de réinitialisation invalide ou expiré.'
  }
}

// Initialise la session quand Supabase fournit un code en query string
async function initRecoveryFromQuery() {
  try {
    const code = String(route.query.code || '')
    const emailQ = String(route.query.email || '')
    if (!code || !emailQ) return
    const { data, error: verErr } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token: code,
      email: emailQ
    })
    if (verErr) throw verErr
    if (data?.user?.email) userEmail.value = data.user.email
    else userEmail.value = emailQ
  } catch (e: any) {
    error.value = e.message || 'Lien de réinitialisation invalide ou expiré.'
  }
}

const sendResetEmail = async () => {
  const { valid } = await requestForm.value.validate()
  if (!valid) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    await auth.resetPassword(email.value)
    message.value = 'Un email de réinitialisation a été envoyé si le compte existe.'
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de l’envoi du lien.'
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  // Validation du formulaire et cohérence des mots de passe
  const { valid } = await updateForm.value.validate()
  if (!valid) return
  if (password.value !== password2.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    // Si pas de session (ex: tokens pas encore appliqués), tenter de l'initialiser depuis l'URL
    const { data: sessionCheck } = await supabase.auth.getSession()
    if (!sessionCheck.session && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      await initRecoverySessionFromURL(window.location.hash)
    }
    const { error: updError } = await supabase.auth.updateUser({ password: password.value })
    if (updError) throw updError
    message.value = 'Mot de passe mis à jour avec succès.'
    setTimeout(() => navigateTo('/auth'), 1200)
  } catch (e: any) {
    error.value = e.message || 'Impossible de mettre à jour le mot de passe.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-page { min-height: 100vh; }
.reset-card { background: rgba(255,255,255,0.96); border: 1px solid #e9ecef; }
</style>
