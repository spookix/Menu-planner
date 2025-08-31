<template>
    <v-container class="pa-0">
      <v-img :src="recipe?.img" height="260" cover />
      <div class="pa-4">
        <h1 class="text-h5 font-weight-bold mb-2">{{ recipe?.title }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-2">{{ recipe?.subtitle }}</p>
  
        <v-card variant="elevated" class="rounded-xl mb-4">
          <v-card-title class="text-subtitle-1">Nutrition</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div><div class="text-caption">Calories</div><div class="text-subtitle-1 font-weight-bold">{{ recipe?.kcal ?? 0 }} kcal</div></div>
              <div><div class="text-caption">Protéines</div><div class="text-subtitle-1 font-weight-bold">{{ recipe?.protein ?? 0 }} g</div></div>
              <div><div class="text-caption">Glucides</div><div class="text-subtitle-1 font-weight-bold">{{ recipe?.carb ?? 0 }} g</div></div>
              <div><div class="text-caption">Lipides</div><div class="text-subtitle-1 font-weight-bold">{{ recipe?.fat ?? 0 }} g</div></div>
            </div>
          </v-card-text>
        </v-card>
  
        <v-card variant="elevated" class="rounded-xl mb-16">
          <v-card-title class="text-subtitle-1">Ingrédients</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="(i, idx) in (recipe?.ingredients ?? [])" :key="idx">
              <template #prepend><v-checkbox-btn v-model="checked[idx]" /></template>
              <v-list-item-title>{{ i }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
  
      <div class="position-fixed left-0 right-0 bottom-16 px-4">
        <v-btn color="primary" size="large" block rounded="xl" @click="addToPlan">Ajouter au Plan</v-btn>
      </div>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { useRecipesStore } from '~/stores/recipes'
  import { usePlannerStore, type MealKey } from '~/stores/planner'
  const route = useRoute()
  const recipes = useRecipesStore()
  const planner = usePlannerStore()
  const id = route.params.id as string
  
  const recipe = ref(await recipes.fetchOne(id))
  const checked = ref((recipe.value?.ingredients ?? []).map(() => false))
  
  // simple: ajoute au premier créneau vide d’aujourd’hui, sinon au déjeuner
  const addToPlan = () => {
    const todayIdx = new Date().getDay(); // 0=Dimanche
    const di = (todayIdx + 6) % 7;
    // Correction : vérifier que planner.plan et planner.plan[di] existent
    let slot: MealKey = 'lunch';
    if (planner.plan && planner.plan[di]) {
      slot = (['breakfast', 'lunch', 'dinner'] as MealKey[]).find(
        m => planner.plan[di]?.[m] === null
      ) ?? 'lunch';
    }
    if (recipe.value) planner.assign(di, slot, recipe.value);
    navigateTo('/planner');
  }
  </script>
  