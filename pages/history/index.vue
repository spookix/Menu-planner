<template>
    <v-container class="py-4 history-container">
      <!-- Header avec titre -->
      <div class="text-center mb-8">
        <h1 class="text-h3 font-weight-bold text-primary mb-2">Historique</h1>
        <p class="text-body-1 text-medium-emphasis">Suivez votre parcours de planification de repas</p>
      </div>

      <!-- Groupe "Last 30 days" -->
      <div class="history-section mb-8">
        <div class="section-header mb-4">
          <h2 class="text-h5 font-weight-bold text-primary">30 Derniers Jours</h2>
          <div class="section-subtitle text-body-2 text-medium-emphasis">
            {{ recent.length }} types de repas planifiés
          </div>
        </div>
        <HistoryGroup title="30 Derniers Jours" :items="recent" />
      </div>

      <!-- Groupe "Older" -->
      <div class="history-section">
        <div class="section-header mb-4">
          <h2 class="text-h5 font-weight-bold text-primary">Plus Ancien</h2>
          <div class="section-subtitle text-body-2 text-medium-emphasis">
            {{ older.length }} types de repas des mois précédents
          </div>
        </div>
        <HistoryGroup title="Plus Ancien" :items="older" />
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
                <div class="stat-value">{{ totalRecipes }}</div>
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
  // Données simulées pour la démonstration
  const recent = [
    { title: 'Dinner', count: 4, img: 'https://picsum.photos/200?7', date: '2024-01-15' },
    { title: 'Lunch', count: 3, img: 'https://picsum.photos/200?8', date: '2024-01-14' },
    { title: 'Breakfast', count: 2, img: 'https://picsum.photos/200?9', date: '2024-01-13' }
  ]
  
  const older = [
    { title: 'Dinner', count: 4, img: 'https://picsum.photos/200?10', date: '2024-01-10' },
    { title: 'Lunch', count: 3, img: 'https://picsum.photos/200?11', date: '2024-01-09' },
    { title: 'Breakfast', count: 2, img: 'https://picsum.photos/200?12', date: '2024-01-08' }
  ]

  // Calculs pour les statistiques
  const totalMeals = computed(() => 
    recent.reduce((sum, item) => sum + item.count, 0) + 
    older.reduce((sum, item) => sum + item.count, 0)
  )

  const totalRecipes = computed(() => recent.length + older.length)

  const averagePerDay = computed(() => 
    totalMeals.value > 0 ? (totalMeals.value / 30).toFixed(1) : '0'
  )
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
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>
  