<template>
    <v-card 
      class="recipe-card" 
      elevation="3" 
      rounded="xl"
      @click="$emit('click')"
    >
      <!-- Image de la recette -->
      <div class="recipe-image-container">
        <v-img 
          v-if="recipe.img" 
          :src="recipe.img" 
          height="200" 
          cover 
          class="recipe-image" 
        />
        <div v-else class="recipe-image-placeholder">
          <v-icon size="64" color="grey">mdi-food</v-icon>
        </div>
        
        <!-- Badge du type de plat -->
        <div class="recipe-type-badge">
          <v-chip 
            size="small" 
            color="primary" 
            variant="tonal"
            class="type-chip"
          >
            {{ recipe.tag || 'Recette' }}
          </v-chip>
        </div>
      </div>

      <!-- Contenu de la carte -->
      <div class="recipe-content pa-4">
        <h3 class="text-h6 font-weight-bold mb-2 recipe-title">{{ recipe.title }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-3 recipe-description">
          {{ recipe.subtitle || 'Aucune description disponible' }}
        </p>
        
        <!-- Métadonnées de la recette -->
        <div class="recipe-metadata">
          <div class="metadata-item" v-if="recipe.time">
            <v-icon size="16" color="primary">mdi-clock</v-icon>
            <span class="text-caption">{{ recipe.time }} min</span>
          </div>
          <div class="metadata-item" v-if="recipe.difficulty">
            <v-icon size="16" color="primary">mdi-star</v-icon>
            <span class="text-caption">{{ recipe.difficulty }}</span>
          </div>
          <div class="metadata-item" v-if="recipe.kcal">
            <v-icon size="16" color="primary">mdi-fire</v-icon>
            <span class="text-caption">{{ recipe.kcal }} kcal</span>
          </div>
        </div>
      </div>

      <!-- Indicateur de clic -->
      <div class="recipe-hover-indicator">
        <v-icon color="white" size="24">mdi-chevron-right</v-icon>
      </div>
    </v-card>
  </template>
  
  <script setup lang="ts">
  import type { Recipe } from '~/stores/recipes'

  defineProps<{ recipe: Recipe }>()
  defineEmits<{ (e: 'click'): void }>()
  </script>

<style scoped>
.recipe-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  overflow: hidden;
  position: relative;
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  border-color: #007bff;
}

.recipe-image-container {
  position: relative;
  overflow: hidden;
}

.recipe-image {
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.recipe-image-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipe-type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}

.type-chip {
  font-weight: 600;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9) !important;
}

.recipe-content {
  background: #ffffff;
}

.recipe-title {
  color: #2c3e50;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-description {
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-metadata {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6c757d;
}

.recipe-hover-indicator {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: rgba(0, 123, 255, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.recipe-card:hover .recipe-hover-indicator {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

@media (max-width: 768px) {
  .recipe-metadata {
    gap: 12px;
  }
  
  .metadata-item {
    font-size: 0.75rem;
  }
}
</style>
  