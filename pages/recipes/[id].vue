<template>
  <v-container class="pa-0">
    <v-skeleton-loader v-if="loading" type="image, article" />
    <template v-else-if="recipe">
      <v-img :src="recipe?.img" height="260" cover />
      <div class="pa-4">
        <h1 class="text-h5 font-weight-bold mb-2">{{ recipe?.title }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-2 recipe-subtitle">{{ recipe?.subtitle }}</p>

        <div v-if="recipe?.recipe_url" class="mb-4">
          <v-btn :href="recipe!.recipe_url" target="_blank" rel="noopener" variant="text" prepend-icon="mdi-open-in-new">
            Ouvrir la recette<span v-if="siteName">  sur {{ siteName }}</span>
          </v-btn>
        </div>

        <!-- Edit dialog (modal) -->
        <v-dialog v-model="showEditDialog" max-width="900" persistent>
          <RecipeForm :recipe="recipe!" @saved="handleSavedInPlace" @cancel="showEditDialog = false" />
        </v-dialog>

        <!-- Delete dialog -->
        <v-dialog v-model="showDeleteDialog" max-width="480">
          <v-card rounded="xl">
            <v-card-title class="text-h6 font-weight-bold">Confirmer la suppression</v-card-title>
            <v-card-text>
              Voulez-vous vraiment supprimer la recette Â« {{ recipe?.title }} Â» ? Cette action est définitive.
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="text" @click="showDeleteDialog = false">Annuler</v-btn>
              <v-btn color="error" @click="confirmDelete">Supprimer</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-card variant="elevated" class="rounded-xl mb-4">
          <v-card-title class="text-subtitle-1">Nutrition</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-caption">Calories</div>
                <div class="text-subtitle-1 font-weight-bold">{{ recipe?.kcal ?? 0 }} kcal</div>
              </div>
              <div>
                <div class="text-caption">Protéines</div>
                <div class="text-subtitle-1 font-weight-bold">{{ recipe?.protein ?? 0 }} g</div>
              </div>
              <div>
                <div class="text-caption">Glucides</div>
                <div class="text-subtitle-1 font-weight-bold">{{ recipe?.carb ?? 0 }} g</div>
              </div>
              <div>
                <div class="text-caption">Lipides</div>
                <div class="text-subtitle-1 font-weight-bold">{{ recipe?.fat ?? 0 }} g</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card variant="elevated" class="rounded-xl mb-16">
          <v-card-title class="text-subtitle-1">Ingrédients</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="(i, idx) in (recipe?.ingredients ?? [])" :key="idx" density="comfortable">
              <template #prepend>
                <v-icon size="14" color="primary" class="mr-2">mdi-circle-small</v-icon>
              </template>
              <v-list-item-title>{{ i }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </div>

      <div class="actions-fixed px-4">
        <div class="d-flex gap-2 mb-3 justify-center">
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-pencil" @click="openEditDialog">Modifier</v-btn>
          <v-btn color="error" variant="tonal" prepend-icon="mdi-delete" @click="showDeleteDialog = true">Supprimer</v-btn>
        </div>
        <v-btn color="primary" size="large" block rounded="xl" @click="addToPlan">Ajouter au Plan</v-btn>
      </div>
    </template>
    <div v-else class="text-center py-8">
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
      <h3 class="text-h5 font-weight-medium mb-2">Recette non trouvée</h3>
      <p class="text-body-1 text-medium-emphasis">Cette recette n'existe pas ou a été supprimée</p>
      <v-btn color="primary" @click="$router.push('/recipes')" class="mt-4">
        Retour aux recettes
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRecipesStore } from '~/stores/recipes'
import type { Recipe } from '~/lib/supabase'
import { usePlannerStore, type MealKey } from '~/stores/planner'
import RecipeForm from '~/components/recipes/RecipeForm.vue'

const route = useRoute()
const recipes = useRecipesStore()
const planner = usePlannerStore()
const showDeleteDialog = ref(false)
const showEditDialog = ref(false)

const id = route.params.id as string

const openEditDialog = () => {
  showEditDialog.value = true
}

const confirmDelete = async () => {
  try {
    await recipes.deleteRecipe(id)
    navigateTo('/recipes')
  } catch (e) {
    console.error('Erreur suppression recette:', e)
  } finally {
    showDeleteDialog.value = false
  }
}

// Charger la recette spécifique depuis Supabase
const recipe = ref<Recipe | null>(null)
const loading = ref(true)

// Nom du site (ex: jow.fr -> Jow, marmiton.fr -> Marmiton)
const siteName = computed(() => {
  const url = recipe.value?.recipe_url
  if (!url) return ''
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const parts = host.split('.')
    const label = parts.length > 1 ? parts[parts.length - 2] : parts[0]
    return label ? label.charAt(0).toUpperCase() + label.slice(1) : ''
  } catch {
    return ''
  }
})

onMounted(async () => {
  try {
    const recipeData = await recipes.loadRecipe(id)
    recipe.value = recipeData
  } catch (error) {
    console.error('Erreur chargement recette:', error)
  } finally {
    loading.value = false
  }
})

const handleSavedInPlace = (saved: Recipe) => {
  recipe.value = saved
  showEditDialog.value = false
}

// simple: ajoute au premier créneau vide d'aujourd'hui, sinon au déjeuner
const addToPlan = () => {
  const todayIdx = new Date().getDay() // 0=Dimanche
  const di = (todayIdx + 6) % 7
  let slot: MealKey = 'lunch'
  if (planner.plan && planner.plan[di]) {
    slot = (['lunch', 'dinner'] as MealKey[]).find(
      m => planner.plan[di]?.[m] === null
    ) ?? 'lunch'
  }
  if (recipe.value) planner.assign(di, slot, recipe.value)
  navigateTo('/planner')
}
</script>



<style scoped>
.recipe-subtitle{white-space:pre-line}

/* Place the action buttons above the bottom navigation, with safe area support */
.actions-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--bottom-nav-height, 80px) + env(safe-area-inset-bottom, 0px) + 12px);
  z-index: 6;
}
</style>
