<template>
  <v-card class="signup-card" max-width="400" elevation="8" rounded="xl">
    <v-card-title class="text-center text-h5 font-weight-bold text-primary py-6">
      Inscription
    </v-card-title>
    
    <v-card-text class="px-6">
      <v-form @submit.prevent="handleSignup" ref="form">
        <v-text-field
          v-model="username"
          label="Nom d'utilisateur"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-account"
          :rules="[rules.required, rules.username]"
          class="mb-4"
        />
        
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-email"
          :rules="[rules.required, rules.email]"
          class="mb-4"
        />
        
        <v-text-field
          v-model="password"
          label="Mot de passe"
          type="password"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-lock"
          :rules="[rules.required, rules.minLength]"
          class="mb-4"
        />
        
        <v-text-field
          v-model="confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-lock-check"
          :rules="[rules.required, rules.confirmPassword]"
          class="mb-6"
        />
        
        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          rounded="lg"
          :loading="loading"
          :disabled="loading"
          class="mb-4"
        >
          <v-icon start class="mr-2">mdi-account-plus</v-icon>
          S'inscrire
        </v-btn>
        
        <div v-if="error" class="text-center mb-4">
          <v-alert 
            :type="error.includes('réussie') || error.includes('vérifier') ? 'success' : 'error'" 
            variant="tonal" 
            class="text-caption"
          >
            {{ error }}
          </v-alert>
        </div>
        
        <div class="text-center">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="emit('switchToLogin')"
          >
            DéjÃ  un compte ? Se connecter
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const form = ref()
const loading = ref(false)
const error = ref('')

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const rules = {
  required: (v: string) => !!v || 'Ce champ est requis',
  username: (v: string) => v.length >= 3 || 'Minimum 3 caractÃ¨res',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email invalide',
  minLength: (v: string) => v.length >= 6 || 'Minimum 6 caractÃ¨res',
  confirmPassword: (v: string) => v === password.value || 'Les mots de passe ne correspondent pas'
}

const handleSignup = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await auth.signUp(email.value, password.value, username.value)
    
    // Vérifier si l'utilisateur doit confirmer son email
    if (result.user && !result.session) {
      // Email de confirmation envoyé
      error.value = 'Veuillez vérifier votre email et cliquer sur le lien de confirmation pour activer votre compte.'
    } else if (result.session) {
      // Connexion automatique réussie
      error.value = 'Inscription réussie ! Vous Ãªtes maintenant connecté.'
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur d\'inscription'
  } finally {
    loading.value = false
  }
}

const emit = defineEmits<{ (e: 'switchToLogin'): void }>()
</script>

<style scoped>
.signup-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e9ecef;
}

.text-primary {
  color: #007bff !important;
}
</style>

