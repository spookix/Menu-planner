<template>
  <v-card class="login-card" max-width="400" elevation="8" rounded="xl">
    <v-card-title class="text-center text-h5 font-weight-bold text-primary py-6">
      Connexion
    </v-card-title>
    
    <v-card-text class="px-6">
      <v-form @submit.prevent="handleLogin" ref="form">
        <v-text-field
          v-model="email"
          label="Email ou Pseudo"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-account"
          :rules="[rules.required]"
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
          <v-icon start class="mr-2">mdi-login</v-icon>
          Se connecter
        </v-btn>
        
        <div v-if="error" class="text-center mb-4">
          <v-alert type="error" variant="tonal" class="text-caption">
            {{ error }}
          </v-alert>
        </div>
        
        <div class="text-center">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="$emit('switchToSignup')"
          >
            Pas encore de compte ? S'inscrire
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const form = ref()
const loading = ref(false)
const error = ref('')

const email = ref('')
const password = ref('')

const rules = {
  required: (v: string) => !!v || 'Ce champ est requis',
  minLength: (v: string) => v.length >= 4 || 'Minimum 6 caractères'
}

const handleLogin = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return
  
  loading.value = true
  error.value = ''
  
  try {
    await auth.signIn(email.value, password.value)
    // La connexion est gérée par le store
  } catch (err: any) {
    error.value = err.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}

defineEmits<{ (e: 'switchToSignup'): void }>()
</script>

<style scoped>
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e9ecef;
}

.text-primary {
  color: #007bff !important;
}
</style>
