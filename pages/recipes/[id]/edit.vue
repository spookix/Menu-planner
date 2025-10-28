<template>
  <v-container class="py-4">
    <v-skeleton-loader v-if="loading" type="article, image" />
    <template v-else>
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h5 font-weight-bold text-primary">Modifier la recette</h1>
        <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="$router.back()">Retour</v-btn>
      </div>
      <RecipeForm :recipe="recipe!" @saved="handleSaved" @cancel="$router.back()" />
    </template>
  </v-container>
  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import RecipeForm from '~/components/recipes/RecipeForm.vue'
import type { Recipe } from '~/lib/supabase'
import { useRecipesStore } from '~/stores/recipes'

const route = useRoute()
const id = route.params.id as string
const recipes = useRecipesStore()

const loading = ref(true)
const recipe = ref<Recipe | null>(null)

onMounted(async () => {
  try {
    recipe.value = await recipes.loadRecipe(id)
  } finally {
    loading.value = false
  }
})

const handleSaved = (saved: Recipe) => {
  navigateTo(`/recipes/${saved.id}`)
}
</script>

<style scoped>
.text-primary { color: #007bff !important; }
</style>

