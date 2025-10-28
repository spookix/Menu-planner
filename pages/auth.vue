<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header text-center mb-8">
        <h1 class="text-h3 font-weight-bold text-primary mb-2">Menu Planner</h1>
        <p class="text-body-1 text-medium-emphasis">Connectez-vous pour gérer vos recettes</p>
      </div>

      <div class="auth-forms">
        <LoginForm 
          v-if="!showSignup" 
          @switch-to-signup="showSignup = true"
          @login-success="handleLoginSuccess"
        />
        <SignupForm 
          v-else 
          @switch-to-login="showSignup = false"
          @signup-success="handleSignupSuccess"
        />
      </div>

      <div class="auth-footer text-center mt-8">
        <p class="text-body-2 text-medium-emphasis">
          En continuant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const showSignup = ref(false)

// Rediriger si déjÃ  connecté
if (process.client && auth.isAuthenticated) {
  await navigateTo('/')
}

const handleLoginSuccess = () => {
  // Redirection automatique aprÃ¨s connexion
  navigateTo('/')
}

const handleSignupSuccess = () => {
  // Basculer vers la connexion aprÃ¨s inscription
  showSignup.value = false
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 500px;
}

.auth-header {
  color: white;
}

.auth-forms {
  display: flex;
  justify-content: center;
}

.auth-footer {
  color: rgba(255, 255, 255, 0.8);
}

.text-primary {
  color: #ffffff !important;
}
</style>

