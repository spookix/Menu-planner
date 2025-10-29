<template>
  <AuthGuard>
    <v-container class="py-4 recipes-container">
      <!-- Header avec titre -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="text-center">
          <h1 class="text-h3 font-weight-bold text-primary mb-2">Recherche de Recettes</h1>
          <p class="text-body-1 text-medium-emphasis">Découvrez de délicieuses recettes pour toutes les occasions</p>
          
          <!-- Message de sélection de repas -->
          <div v-if="isMealSelectionMode" class="meal-selection-info mt-4">
            <v-alert type="info" variant="tonal" class="text-center">
              <v-icon class="mr-2">mdi-calendar-plus</v-icon>
              Sélectionnez une recette pour le {{ selectedMeal === 'lunch' ? 'déjeuner' : 'dÃ®ner' }} du {{ selectedDate?.toLocaleDateString('fr-FR') }}
            </v-alert>
          </div>
        </div>
        
        <v-btn
          v-if="auth.isAuthenticated"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="openCreate()"
          class="create-button"
        >
          Nouvelle Recette
        </v-btn>
      </div>

      <!-- Barre de recherche en forme de pill -->
      <div class="search-container mb-6">
        <v-text-field 
          v-model="store.query" 
          variant="solo" 
          rounded="xl"
          placeholder="Rechercher des recettes, ingrédients..." 
          prepend-inner-icon="mdi-magnify"
          class="search-input"
          @input="store.search()"
          hide-details
        />
      </div>

      <!-- Filtres en boutons arrondis -->
      <FilterBar 
        class="mb-6"
        @update:time="store.updateFilters({ time: $event })"
        @update:difficulty="store.updateFilters({ difficulty: $event })" 
      />

      <!-- Résultats avec compteur -->
      <div class="results-header mb-4">
        <h2 class="text-h5 font-weight-bold text-primary">Résultats ({{ store.filtered.length }})</h2>
        <div class="text-body-2 text-medium-emphasis">
          {{ store.loading ? 'Recherche en cours...' : `${store.filtered.length} recettes trouvées` }}
        </div>
      </div>

      <!-- Skeleton loader pendant le chargement -->
      <v-skeleton-loader v-if="store.loading" type="card@6" class="mb-4" />
      
      <!-- Grille de cartes de résultats -->
      <div v-else class="results-grid">
        <RecipeCard 
          v-for="r in store.filtered" 
          :key="r.id" 
          :recipe="r"
          @click="isMealSelectionMode ? addRecipeToPlan(r) : $router.push(`/recipes/${r.id}`)"
          @edit="openEdit(r)"
          @delete="openDelete(r)"
        />
      </div>

      <!-- Message si aucun résultat -->
      <div v-if="!store.loading && store.filtered.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey" class="mb-4">mdi-food-off</v-icon>
        <h3 class="text-h5 font-weight-medium mb-2">Aucune recette trouvée</h3>
        <p class="text-body-1 text-medium-emphasis">Essayez d'ajuster votre recherche ou vos filtres</p>
      </div>

      <!-- Formulaire de création de recette -->
      <v-dialog v-model="showCreateForm" max-width="900" persistent>
        <RecipeForm :recipe="activeRecipe || undefined" @saved="handleRecipeSaved" @cancel="showCreateForm = false" />
      </v-dialog>
      <v-dialog v-model="showDeleteDialog" max-width="480">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold">Confirmer la suppression</v-card-title>
          <v-card-text>
            Supprimer « {{ toDelete?.title }} » ? Cette action est définitive.
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="showDeleteDialog = false">Annuler</v-btn>
            <v-btn color="error" @click="confirmDelete">Supprimer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </AuthGuard>
</template>
  
    <script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { useRecipesStore } from "~/stores/recipes"
import { useAuthStore } from "~/stores/auth"
import { usePlannerStore } from "~/stores/planner"

const store = useRecipesStore()
const auth = useAuthStore()
const planner = usePlannerStore()
const showCreateForm = ref(false)
const activeRecipe = ref<any | null>(null)

const route = useRoute()
const selectedDate = computed(() => {
  const dateParam = route.query.selectedDate as string
  return dateParam ? new Date(dateParam) : null
})
const selectedMeal = computed(() => route.query.selectedMeal as 'lunch'|'dinner' | null)
const isMealSelectionMode = computed(() => !!(selectedDate.value && selectedMeal.value))

const addRecipeToPlan = async (recipe: any) => {
  if (!selectedDate.value || !selectedMeal.value) return
  try {
    await planner.saveMealPlan(selectedDate.value, selectedMeal.value, recipe)
    navigateTo('/planner')
  } catch (error) {
    console.error('Erreur ajout recette au planning:', error)
  }
}

onMounted(async () => {
  await store.loadRecipes()
})

const handleRecipeSaved = (recipe: any) => {
  showCreateForm.value = false
  activeRecipe.value = null
}

const openCreate = () => {
  activeRecipe.value = null
  showCreateForm.value = true
}

const openEdit = (r: any) => {
  activeRecipe.value = r
  showCreateForm.value = true
}

// Mise à jour des résultats en temps réel sur la saisie
watch(() => store.query, () => {
  store.search()
})

const showDeleteDialog = ref(false)
const toDelete = ref<any | null>(null)
const openDelete = (r: any) => { toDelete.value = r; showDeleteDialog.value = true }
const confirmDelete = async () => {
  if (!toDelete.value) return
  try {
    await store.deleteRecipe(toDelete.value.id)
    showDeleteDialog.value = false
    toDelete.value = null
  } catch (e) {
    console.error('Erreur suppression recette:', e)
  }
}
</script>

<style scoped>
.recipes-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.search-input:hover {
  border-color: rgba(0, 123, 255, 0.3);
  background: #ffffff;
}

.search-input:focus-within {
  border-color: #007bff;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 123, 255, 0.15);
}

.results-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 12px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.text-primary {
  color: #007bff !important;
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .text-h3 {
    font-size: 2rem !important;
  }
}
</style>
  




