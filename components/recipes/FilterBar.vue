<template>
    <div class="filter-bar">
      <div class="filter-container">
        <!-- Filtre Type de plat -->
        <v-menu location="bottom" offset="8">
          <template #activator="{ props }">
            <v-btn 
              v-bind="props" 
              rounded="xl" 
              variant="tonal" 
              class="filter-button"
              :color="store.filters.type ? 'primary' : 'default'"
            >
              <v-icon start class="mr-2">mdi-food</v-icon>
              {{ store.filters.type || 'Type de Plat' }}
              <v-icon end class="ml-2">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list class="filter-menu">
            <v-list-item 
              v-for="t in ['Entrée','Plat Principal','Dessert']" 
              :key="t" 
              @click="$emit('update:type', t)"
              class="filter-item"
            >
              {{ t }}
            </v-list-item>
            <v-divider class="my-2" />
            <v-list-item @click="$emit('update:type', null)" class="filter-item clear-filter">
              <v-icon start>mdi-close</v-icon>
              Effacer le filtre
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Filtre Temps de préparation -->
        <v-menu location="bottom" offset="8">
          <template #activator="{ props }">
            <v-btn 
              v-bind="props" 
              rounded="xl" 
              variant="tonal" 
              class="filter-button"
              :color="store.filters.time ? 'primary' : 'default'"
            >
              <v-icon start class="mr-2">mdi-clock</v-icon>
              {{ store.filters.time ? `${store.filters.time} min` : 'Temps de Préparation' }}
              <v-icon end class="ml-2">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list class="filter-menu">
            <v-list-item 
              v-for="t in [15,30,45,60]" 
              :key="t" 
              @click="$emit('update:time', t)"
              class="filter-item"
            >
              {{ t }} min
            </v-list-item>
            <v-divider class="my-2" />
            <v-list-item @click="$emit('update:time', null)" class="filter-item clear-filter">
              <v-icon start>mdi-close</v-icon>
              Effacer le filtre
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Filtre Difficulté -->
        <v-menu location="bottom" offset="8">
          <template #activator="{ props }">
            <v-btn 
              v-bind="props" 
              rounded="xl" 
              variant="tonal" 
              class="filter-button"
              :color="store.filters.difficulty ? 'primary' : 'default'"
            >
              <v-icon start class="mr-2">mdi-star</v-icon>
              {{ store.filters.difficulty || 'Difficulté' }}
              <v-icon end class="ml-2">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list class="filter-menu">
            <v-list-item 
              v-for="t in ['Facile','Moyen','Difficile']" 
              :key="t" 
              @click="$emit('update:difficulty', t)"
              class="filter-item"
            >
              {{ t }}
            </v-list-item>
            <v-divider class="my-2" />
            <v-list-item @click="$emit('update:difficulty', null)" class="filter-item clear-filter">
              <v-icon start>mdi-close</v-icon>
              Effacer le filtre
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { useRecipesStore } from '~/stores/recipes'

const store = useRecipesStore()

defineEmits<{ 
  (e:'update:type', v:string|null):void; 
  (e:'update:time', v:number|null):void; 
  (e:'update:difficulty', v:string|null):void 
}>()
</script>

<style scoped>
.filter-bar {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.filter-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-button {
  min-width: 140px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.filter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-menu {
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
}

.filter-item {
  border-radius: 8px;
  margin: 4px 8px;
  min-height: 44px;
  transition: all 0.2s ease;
}

.filter-item:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.clear-filter {
  color: #dc3545;
}

.clear-filter:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

@media (max-width: 768px) {
  .filter-container {
    gap: 12px;
  }
  
  .filter-button {
    min-width: 120px;
    height: 44px;
    font-size: 0.875rem;
  }
}
</style>
  