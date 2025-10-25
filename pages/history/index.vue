<template>
  <v-container class="py-4 history-container">
    <!-- Header avec titre -->
    <div class="text-center mb-8">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">Historique</h1>
      <p class="text-body-1 text-medium-emphasis">Découvrez vos recettes les plus consommées</p>
    </div>

    <!-- Section 30 derniers jours -->
    <div class="history-section mb-8">
      <div class="section-header mb-6">
        <h2 class="text-h5 font-weight-bold text-primary">30 Derniers Jours</h2>
        <div class="section-subtitle text-body-2 text-medium-emphasis">
          Vos recettes les plus populaires récemment
        </div>
      </div>
      
      <!-- Carrousel des top recettes récentes -->
      <div class="carousel-container">
        <div class="carousel-header">
          <h3 class="text-h6 font-weight-bold">Top 10 Recettes</h3>
          <div class="carousel-nav">
            <v-btn 
              icon="mdi-chevron-left" 
              variant="text" 
              size="small"
              @click="previousRecent"
              :disabled="recentStartIndex === 0"
            />
            <span class="carousel-counter">
              {{ recentStartIndex + 1 }}-{{ Math.min(recentStartIndex + 3, topRecentRecipes.length) }} / {{ topRecentRecipes.length }}
            </span>
            <v-btn 
              icon="mdi-chevron-right" 
              variant="text" 
              size="small"
              @click="nextRecent"
              :disabled="recentStartIndex + 3 >= topRecentRecipes.length"
            />
          </div>
        </div>
        
        <div class="carousel-content">
          <div 
            v-for="recipe in visibleRecentRecipes" 
            :key="recipe.id"
            class="recipe-card"
            @click="$router.push(`/recipes/${recipe.id}`)"
          >
            <v-img :src="recipe.img" height="120" cover class="recipe-image" />
            <div class="recipe-info">
              <h4 class="recipe-title">{{ recipe.title }}</h4>
              <div class="recipe-stats">
                <span class="consumption-count">{{ recipe.consumptionCount }} fois</span>
                <span class="last-consumed">{{ formatLastConsumed(recipe.lastConsumed) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Plus Ancien -->
    <div class="history-section">
      <div class="section-header mb-6">
        <h2 class="text-h5 font-weight-bold text-primary">Depuis le Début</h2>
        <div class="section-subtitle text-body-2 text-medium-emphasis">
          Vos recettes favorites de tous les temps
        </div>
      </div>
      
      <!-- Carrousel des top recettes de tous les temps -->
      <div class="carousel-container">
        <div class="carousel-header">
          <h3 class="text-h6 font-weight-bold">Top 10 Recettes</h3>
          <div class="carousel-nav">
            <v-btn 
              icon="mdi-chevron-left" 
              variant="text" 
              size="small"
              @click="previousAllTime"
              :disabled="allTimeStartIndex === 0"
            />
            <span class="carousel-counter">
              {{ allTimeStartIndex + 1 }}-{{ Math.min(allTimeStartIndex + 3, topAllTimeRecipes.length) }} / {{ topAllTimeRecipes.length }}
            </span>
            <v-btn 
              icon="mdi-chevron-right" 
              variant="text" 
              size="small"
              @click="nextAllTime"
              :disabled="allTimeStartIndex + 3 >= topAllTimeRecipes.length"
            />
          </div>
        </div>
        
        <div class="carousel-content">
          <div 
            v-for="recipe in visibleAllTimeRecipes" 
            :key="recipe.id"
            class="recipe-card"
            @click="$router.push(`/recipes/${recipe.id}`)"
          >
            <v-img :src="recipe.img" height="120" cover class="recipe-image" />
            <div class="recipe-info">
              <h4 class="recipe-title">{{ recipe.title }}</h4>
              <div class="recipe-stats">
                <span class="consumption-count">{{ recipe.totalConsumption }} fois</span>
                <span class="first-consumed">{{ formatFirstConsumed(recipe.firstConsumed) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques globales -->
    <div class="stats-container mt-8">
      <v-card variant="tonal" class="stats-card" rounded="xl">
        <v-card-text class="text-center">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ totalMeals }}</div>
              <div class="stat-label">Total Repas</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ uniqueRecipes }}</div>
              <div class="stat-label">Recettes Uniques</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ averagePerDay }}</div>
              <div class="stat-label">Moy/Jour</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>
  
<script setup lang="ts">
import { ref, computed } from 'vue'

// Données simulées pour la démonstration - Top 10 recettes des 30 derniers jours
const topRecentRecipes = [
  { id: '1', title: 'Salade Quinoa Méditerranéenne', img: 'https://picsum.photos/200?1', consumptionCount: 8, lastConsumed: '2024-01-15' },
  { id: '2', title: 'Soupe de Lentilles', img: 'https://picsum.photos/200?2', consumptionCount: 6, lastConsumed: '2024-01-14' },
  { id: '3', title: 'Skewers Caprese', img: 'https://picsum.photos/200?3', consumptionCount: 5, lastConsumed: '2024-01-13' },
  { id: '4', title: 'Mousse Chocolat Avocat', img: 'https://picsum.photos/200?4', consumptionCount: 4, lastConsumed: '2024-01-12' },
  { id: '5', title: 'Pâtes Carbonara', img: 'https://picsum.photos/200?5', consumptionCount: 4, lastConsumed: '2024-01-11' },
  { id: '6', title: 'Risotto aux Champignons', img: 'https://picsum.photos/200?6', consumptionCount: 3, lastConsumed: '2024-01-10' },
  { id: '7', title: 'Tartare de Saumon', img: 'https://picsum.photos/200?7', consumptionCount: 3, lastConsumed: '2024-01-09' },
  { id: '8', title: 'Ratatouille Provençale', img: 'https://picsum.photos/200?8', consumptionCount: 2, lastConsumed: '2024-01-08' },
  { id: '9', title: 'Couscous Marocain', img: 'https://picsum.photos/200?9', consumptionCount: 2, lastConsumed: '2024-01-07' },
  { id: '10', title: 'Tarte Tatin', img: 'https://picsum.photos/200?10', consumptionCount: 1, lastConsumed: '2024-01-06' }
]

// Données simulées pour la démonstration - Top 10 recettes de tous les temps
const topAllTimeRecipes = [
  { id: '1', title: 'Salade Quinoa Méditerranéenne', img: 'https://picsum.photos/200?1', totalConsumption: 45, firstConsumed: '2023-06-15' },
  { id: '2', title: 'Soupe de Lentilles', img: 'https://picsum.photos/200?2', totalConsumption: 38, firstConsumed: '2023-05-20' },
  { id: '3', title: 'Pâtes Carbonara', img: 'https://picsum.photos/200?5', totalConsumption: 32, firstConsumed: '2023-04-10' },
  { id: '4', title: 'Risotto aux Champignons', img: 'https://picsum.photos/200?6', totalConsumption: 28, firstConsumed: '2023-07-05' },
  { id: '5', title: 'Skewers Caprese', img: 'https://picsum.photos/200?3', totalConsumption: 25, firstConsumed: '2023-08-12' },
  { id: '6', title: 'Tartare de Saumon', img: 'https://picsum.photos/200?7', totalConsumption: 22, firstConsumed: '2023-09-18' },
  { id: '7', title: 'Mousse Chocolat Avocat', img: 'https://picsum.photos/200?4', totalConsumption: 20, firstConsumed: '2023-10-03' },
  { id: '8', title: 'Ratatouille Provençale', img: 'https://picsum.photos/200?8', totalConsumption: 18, firstConsumed: '2023-11-15' },
  { id: '9', title: 'Couscous Marocain', img: 'https://picsum.photos/200?9', totalConsumption: 15, firstConsumed: '2023-12-01' },
  { id: '10', title: 'Tarte Tatin', img: 'https://picsum.photos/200?10', totalConsumption: 12, firstConsumed: '2024-01-02' }
]

// Indices pour la navigation des carrousels
const recentStartIndex = ref(0)
const allTimeStartIndex = ref(0)

// Recettes visibles dans les carrousels (3 à la fois)
const visibleRecentRecipes = computed(() => 
  topRecentRecipes.slice(recentStartIndex.value, recentStartIndex.value + 3)
)

const visibleAllTimeRecipes = computed(() => 
  topAllTimeRecipes.slice(allTimeStartIndex.value, allTimeStartIndex.value + 3)
)

// Navigation des carrousels
const previousRecent = () => {
  if (recentStartIndex.value > 0) {
    recentStartIndex.value -= 3
  }
}

const nextRecent = () => {
  if (recentStartIndex.value + 3 < topRecentRecipes.length) {
    recentStartIndex.value += 3
  }
}

const previousAllTime = () => {
  if (allTimeStartIndex.value > 0) {
    allTimeStartIndex.value -= 3
  }
}

const nextAllTime = () => {
  if (allTimeStartIndex.value + 3 < topAllTimeRecipes.length) {
    allTimeStartIndex.value += 3
  }
}

// Fonctions de formatage des dates
const formatLastConsumed = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  return `Il y a ${Math.floor(diffDays / 30)} mois`
}

const formatFirstConsumed = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', { 
    month: 'short', 
    year: 'numeric' 
  })
}

// Calculs pour les statistiques
const totalMeals = computed(() => 
  topAllTimeRecipes.reduce((sum, recipe) => sum + recipe.totalConsumption, 0)
)

const uniqueRecipes = computed(() => topAllTimeRecipes.length)

const averagePerDay = computed(() => {
  const totalDays = 365 // Approximation sur un an
  return totalMeals.value > 0 ? (totalMeals.value / totalDays).toFixed(1) : '0'
})
</script>

<style scoped>
.history-container {
  max-width: 1000px;
  margin: 0 auto;
}

.history-section {
  animation: fadeInUp 0.6s ease;
}

.section-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 12px;
}

.section-subtitle {
  margin-top: 4px;
}

.carousel-container {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e9ecef;
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.carousel-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.carousel-counter {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.carousel-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  border-radius: 12px 12px 0 0;
}

.recipe-info {
  padding: 16px;
}

.recipe-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consumption-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #007bff;
}

.last-consumed,
.first-consumed {
  font-size: 0.75rem;
  color: #6c757d;
}

.stats-container {
  animation: fadeInUp 0.8s ease;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e9ecef;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.text-primary {
  color: #007bff !important;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .history-container {
    padding: 16px;
  }
  
  .text-h3 {
    font-size: 2rem !important;
  }
  
  .carousel-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .carousel-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .carousel-nav {
    align-self: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>
  