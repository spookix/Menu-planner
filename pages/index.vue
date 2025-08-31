<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="home-page">
    <div class="home-container">
      <div class="hero-section text-center mb-8">
        <v-icon size="80" color="primary" class="mb-4">mdi-food</v-icon>
        <h1 class="text-h2 font-weight-bold text-primary mb-4">Menu Planner</h1>
        <p class="text-h5 text-medium-emphasis mb-6">
          Planifiez vos repas, découvrez des recettes et organisez vos courses
        </p>
        
        <div class="hero-buttons d-flex gap-4 justify-center">
          <v-btn
            v-if="!auth.isAuthenticated"
            color="primary"
            size="x-large"
            rounded="xl"
            @click="$router.push('/auth')"
            class="hero-button"
            elevation="8"
          >
            <v-icon start class="mr-3">mdi-login</v-icon>
            Commencer
          </v-btn>
          
          <v-btn
            v-else
            color="primary"
            size="x-large"
            rounded="xl"
            @click="$router.push('/recipes')"
            class="hero-button"
            elevation="8"
          >
            <v-icon start class="mr-3">mdi-book</v-icon>
            Voir les Recettes
          </v-btn>
        </div>
      </div>

      <!-- Fonctionnalités -->
      <div class="features-section">
        <h2 class="text-h4 font-weight-bold text-center mb-6">Fonctionnalités</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <v-icon size="48" color="primary" class="mb-3">mdi-book</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Recettes</h3>
            <p class="text-body-2 text-medium-emphasis">
              Découvrez et créez de délicieuses recettes
            </p>
          </div>
          
          <div class="feature-card">
            <v-icon size="48" color="primary" class="mb-3">mdi-calendar</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Planification</h3>
            <p class="text-body-2 text-medium-emphasis">
              Planifiez vos repas de la semaine
            </p>
          </div>
          
          <div class="feature-card">
            <v-icon size="48" color="primary" class="mb-3">mdi-cart</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Liste de Courses</h3>
            <p class="text-body-2 text-medium-emphasis">
              Générez automatiquement vos listes de courses
            </p>
          </div>
          
          <div class="feature-card">
            <v-icon size="48" color="primary" class="mb-3">mdi-clock</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Historique</h3>
            <p class="text-body-2 text-medium-emphasis">
              Suivez vos habitudes alimentaires
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  padding: 60px 20px;
}

.hero-button {
  min-width: 200px;
}

.features-section {
  padding: 40px 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.text-primary {
  color: #007bff !important;
}

@media (max-width: 768px) {
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-button {
    min-width: 250px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
