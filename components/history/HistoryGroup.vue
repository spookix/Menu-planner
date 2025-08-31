<template>
    <div class="history-group">
      <div class="history-cards">
        <div 
          v-for="item in items" 
          :key="item.title"
          class="history-card-wrapper"
        >
          <v-card 
            class="history-card" 
            variant="elevated" 
            rounded="xl"
            elevation="3"
          >
            <div class="card-content">
              <!-- Image de la recette -->
              <div class="recipe-image-container">
                <v-img 
                  :src="item.img" 
                  width="80" 
                  height="80" 
                  class="rounded-lg" 
                  cover 
                />
                <div class="image-overlay">
                  <v-icon color="white" size="24">mdi-food</v-icon>
                </div>
              </div>

              <!-- Informations de la recette -->
              <div class="recipe-info">
                <div class="recipe-title">{{ item.title }}</div>
                <div class="recipe-count">{{ item.count }} recipes</div>
                <div class="recipe-date" v-if="item.date">
                  {{ formatDate(item.date) }}
                </div>
              </div>

              <!-- Bouton d'action -->
              <div class="card-actions">
                <v-btn 
                  icon 
                  variant="text" 
                  color="primary"
                  size="small"
                  class="action-button"
                >
                  <v-icon size="20">mdi-dots-vertical</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{ 
    title: string; 
    items: { 
      title: string; 
      count: number; 
      img: string; 
      date?: string;
    }[] 
  }>()

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
  </script>

<style scoped>
.history-group {
  margin-bottom: 24px;
}

.history-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.history-card-wrapper {
  transition: transform 0.3s ease;
}

.history-card-wrapper:hover {
  transform: translateY(-4px);
}

.history-card {
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  overflow: hidden;
}

.history-card:hover {
  border-color: #007bff;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.recipe-image-container {
  position: relative;
  flex-shrink: 0;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.history-card:hover .image-overlay {
  opacity: 1;
}

.recipe-info {
  flex-grow: 1;
  min-width: 0;
}

.recipe-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1.3;
}

.recipe-count {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
}

.recipe-date {
  font-size: 0.75rem;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-actions {
  flex-shrink: 0;
}

.action-button {
  transition: all 0.3s ease;
}

.action-button:hover {
  background-color: rgba(0, 123, 255, 0.1);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .history-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .card-content {
    padding: 12px;
    gap: 12px;
  }
  
  .recipe-image-container {
    width: 64px;
    height: 64px;
  }
  
  .recipe-title {
    font-size: 1rem;
  }
}
</style>
  