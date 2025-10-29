<template>
  <AuthGuard>
    <v-container class="py-4 grocery-container">
      <!-- Header avec titre et bouton -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold text-primary">Liste de Courses</h1>
          <p class="text-body-1 text-medium-emphasis mt-1">Organisez vos courses alimentaires</p>
        </div>
        <v-btn 
          color="primary" 
          variant="tonal" 
          prepend-icon="mdi-cart-plus"
          @click="grocery.generateFromPlan()"
          class="generate-button"
        >
          Générer depuis le Plan
        </v-btn>
      </div>

      <!-- Sections de courses -->
      <div class="sections-container">
        <div 
          v-for="section in grocery.sections" 
          :key="section.title" 
          class="section-wrapper mb-6"
        >
          <!-- En-tête de section -->
          <div class="section-header mb-3">
            <h2 class="text-h6 font-weight-bold text-primary">{{ section.title }}</h2>
            <div class="section-count">
              {{ section.items.filter(item => !item.done).length }} sur {{ section.items.length }} articles
            </div>
          </div>

          <!-- Carte sombre avec items -->
          <v-card 
            variant="elevated" 
            class="section-card" 
            rounded="xl"
            elevation="4"
          >
            <v-card-text class="pa-0">
              <div class="items-list">
                <div 
                  v-for="(item, i) in section.items" 
                  :key="i"
                  class="grocery-item"
                  :class="{ 'item-completed': item.done }"
                >
                  <v-checkbox-btn 
                    v-model="item.done" 
                    color="primary"
                    class="item-checkbox"
                  />
                  <span class="item-label">{{ item.label }}</span>
                  
                  <!-- Indicateur de statut -->
                  <div class="item-status">
                    <v-icon 
                      v-if="item.done" 
                      size="20" 
                      color="success"
                      class="status-icon"
                    >
                      mdi-check-circle
                    </v-icon>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Message si liste vide -->
      <div v-if="grocery.sections.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey" class="mb-4">mdi-cart-off</v-icon>
        <h3 class="text-h5 font-weight-medium mb-2">Votre liste de courses est vide</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          Générez une liste depuis votre plan de repas ou ajoutez des articles manuellement
        </p>
        <v-btn 
          color="primary" 
          variant="tonal"
          @click="grocery.generateFromPlan()"
        >
          Générer depuis le Plan
        </v-btn>
      </div>

      <!-- Résumé en bas -->
      <div v-if="grocery.sections.length > 0" class="summary-card">
        <v-card variant="tonal" class="summary-content" rounded="xl">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6 font-weight-bold">Progression des Courses</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ totalCompleted }} sur {{ totalItems }} articles termin�s
              </div>
            </div>
            <div class="progress-circle">
              <v-progress-circular
                :model-value="progressPercentage"
                :size="60"
                :width="6"
                color="primary"
                class="progress-indicator"
              >
                {{ Math.round(progressPercentage) }}%
              </v-progress-circular>
            </div>
          </div>
        </v-card>
      </div>
    </v-container>
</AuthGuard>
</template>
  
  <script setup lang="ts">
  import { useGroceryStore } from '~/stores/grocery'

  const grocery = useGroceryStore()

  // Calculs pour le résumé
  const totalItems = computed(() => 
    grocery.sections.reduce((total, section) => total + section.items.length, 0)
  )

  const totalCompleted = computed(() => 
    grocery.sections.reduce((total, section) => 
      total + section.items.filter(item => item.done).length, 0
    )
  )

  const progressPercentage = computed(() => 
    totalItems.value > 0 ? (totalCompleted.value / totalItems.value) * 100 : 0
  )
  </script>
  
  <style scoped>
  .grocery-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .generate-button {
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.3px;
  }

  .sections-container {
    margin-bottom: 24px;
  }

  .section-wrapper {
    animation: slideIn 0.5s ease;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 8px;
  }

  .section-count {
    font-size: 0.875rem;
    color: #6c757d;
    font-weight: 500;
  }

  .section-card {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border: 1px solid #34495e;
    color: white;
  }

  .items-list {
    padding: 16px;
  }

  .grocery-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .grocery-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
  }

  .grocery-item:last-child {
    margin-bottom: 0;
  }

  .item-completed {
    background: rgba(40, 167, 69, 0.2);
    border-color: rgba(40, 167, 69, 0.3);
    opacity: 0.7;
  }

  .item-checkbox {
    flex-shrink: 0;
  }

  .item-label {
    flex-grow: 1;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    transition: all 0.3s ease;
  }

  .item-completed .item-label {
    text-decoration: line-through;
    color: rgba(255, 255, 255, 0.7);
  }

  .item-status {
    flex-shrink: 0;
  }

  .status-icon {
    animation: checkIn 0.5s ease;
  }

  .summary-card {
    position: sticky;
    bottom: 16px;
    z-index: 10;
  }

  .summary-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid #e9ecef;
  }

  .progress-circle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-indicator {
    font-weight: 600;
    font-size: 0.875rem;
  }

  .text-primary {
    color: #007bff !important;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes checkIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .grocery-container {
      padding: 16px;
    }
    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .grocery-item {
      padding: 12px;
      gap: 12px;
    }
    
    .summary-card {
      bottom: 8px;
    }
  }
  </style>
  


