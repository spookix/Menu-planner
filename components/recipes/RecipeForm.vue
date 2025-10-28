<template>
  <v-card class="recipe-form-card" max-width="800" elevation="8" rounded="xl">
    <v-card-title class="text-center text-h5 font-weight-bold text-primary py-6">
      {{ isEditing ? (recipe.title || 'Modifier la Recette') : 'Nouvelle Recette' }}
    </v-card-title>
    <v-card-text class="px-6 pt-0" v-if="isEditing && recipe.img">
      <v-img :src="recipe.img" height="220" cover rounded="lg" class="mb-4" />
    </v-card-text>
    
    <v-card-text class="px-6">
      <v-form @submit.prevent="handleSubmit" ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="recipe.title"
              label="Titre de la recette *"
              variant="outlined"
              rounded="lg"
              :rules="[rules.required]"
              class="mb-4"
            />
          </v-col>
          
          <v-col cols="12" md="6">
            <v-textarea
              v-model="recipe.subtitle"
              label="Description courte"
              variant="outlined"
              rounded="lg"
              class="mb-4"
              auto-grow
              rows="2"
              hint="Vous pouvez saisir plusieurs lignes"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="recipe.difficulty"
              label="Difficulté"
              variant="outlined"
              rounded="lg"
              :items="['Facile', 'Moyen', 'Difficile']"
              class="mb-4"
            />
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="recipe.time"
              label="Temps (minutes)"
              type="number"
              variant="outlined"
              rounded="lg"
              class="mb-4"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="recipe.kcal"
              label="Calories (kcal)"
              type="number"
              variant="outlined"
              rounded="lg"
              class="mb-4"
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="recipe.protein"
              label="Protéines (g)"
              type="number"
              variant="outlined"
              rounded="lg"
              class="mb-4"
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="recipe.carb"
              label="Glucides (g)"
              type="number"
              variant="outlined"
              rounded="lg"
              class="mb-4"
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="recipe.fat"
              label="Lipides (g)"
              type="number"
              variant="outlined"
              rounded="lg"
              class="mb-4"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="recipe.img"
          label="URL de l'image"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-image"
          class="mb-4"
        />

        <v-text-field
          v-model="recipe.recipe_url"
          label="URL de la recette"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-link-variant"
          class="mb-4"
          hint="Lien vers la source de la recette"
        />

        <v-textarea
          v-model="ingredientsText"
          label="Ingrédients (un par ligne) *"
          variant="outlined"
          rounded="lg"
          rows="4"
          :rules="[rules.required]"
          class="mb-4"
          hint="Entrez un ingrédient par ligne"
        />

        <v-row class="mb-4">
          <v-col cols="12">
            <v-checkbox
              v-model="recipe.vegetarian"
              label="Recette végétarienne"
              color="primary"
            />
          </v-col>
        </v-row>

        <div class="d-flex gap-3 justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            size="large"
            rounded="lg"
            @click="emit('cancel')"
            :disabled="loading"
          >
            Annuler
          </v-btn>
          
          <v-btn
            type="submit"
            color="primary"
            size="large"
            rounded="lg"
            :loading="loading"
            :disabled="loading"
          >
            <v-icon start class="mr-2">
              {{ isEditing ? 'mdi-content-save' : 'mdi-plus' }}
            </v-icon>
            {{ isEditing ? 'Sauvegarder' : 'Créer' }}
          </v-btn>
        </div>

        <div v-if="error" class="text-center mt-4">
          <v-alert type="error" variant="tonal" class="text-caption">
            {{ error }}
          </v-alert>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRecipesStore } from '~/stores/recipes'
import type { Recipe } from '~/lib/supabase'

const props = defineProps<{
  recipe?: Recipe
}>()

const emit = defineEmits<{
  (e: 'saved', recipe: Recipe): void
  (e: 'cancel'): void
}>()

const recipes = useRecipesStore()
const form = ref()
const loading = ref(false)
const error = ref('')

// Données de la recette
const recipe = ref<Partial<Recipe>>({
  title: '',
  subtitle: '',
  
  difficulty: 'Facile',
  time: 30,
  kcal: 0,
  protein: 0,
  carb: 0,
  fat: 0,
  ingredients: [],
  vegetarian: false,
  img: '',
  recipe_url: '',
  favorite: false
})

// Gestion des ingrédients en texte
const ingredientsText = ref('')

const isEditing = computed(() => !!props.recipe)

const rules = {
  required: (v: any) => !!v || 'Ce champ est requis'
}

// Initialiser le formulaire si on édite
onMounted(() => {
  if (props.recipe) {
    recipe.value = { ...props.recipe }
    ingredientsText.value = props.recipe.ingredients?.join('\n') || ''
  }
})

// Mettre à jour si la recette passée en prop change (ou bascule création/édition)
watch(() => props.recipe, (val) => {
  if (val) {
    recipe.value = { ...val }
    ingredientsText.value = val.ingredients?.join('\n') || ''
  } else {
    // reset to defaults for creation mode
    recipe.value = {
      title: '',
      subtitle: '',
      
      difficulty: 'Facile',
      time: 30,
      kcal: 0,
      protein: 0,
      carb: 0,
      fat: 0,
      ingredients: [],
      vegetarian: false,
      img: '',
      recipe_url: '',
      favorite: false
    }
    ingredientsText.value = ''
  }
})

// Convertir le texte des ingrédients en tableau
const parseIngredients = () => {
  return ingredientsText.value
    .split('\n')
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0)
}

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Préparer les données
    const recipeData = {
      ...recipe.value,
      ingredients: parseIngredients()
    }

    let savedRecipe: Recipe

    if (isEditing.value && props.recipe) {
      // Mise Ã  jour
      savedRecipe = await recipes.updateRecipe(props.recipe.id, recipeData)
    } else {
      // Création
      savedRecipe = await recipes.createRecipe(recipeData as Omit<Recipe, 'id' | 'created_at' | 'updated_at'>)
    }

    emit('saved', savedRecipe)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la sauvegarde'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recipe-form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e9ecef;
}

.text-primary {
  color: #007bff !important;
}
</style>


