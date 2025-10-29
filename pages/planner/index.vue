<template>
  <AuthGuard>
    <v-container class="py-4 planner-container">
      <!-- Header avec titre et bouton d'ajout -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-primary">Planificateur de Repas</h1>
        <div class="d-flex align-center gap-3">
          <v-btn 
            color="secondary" 
            icon 
            size="large"
            elevation="2"
            @click="refreshPlans" 
            class="refresh-button"
            :loading="planner.loading"
          >
            <v-icon size="24">mdi-refresh</v-icon>
          </v-btn>
          <v-btn 
            color="primary" 
            icon 
            size="large"
            elevation="4"
            @click="goToCalendarAndAdd" 
            class="add-button"
          >
            <v-icon size="28">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Tabs Week / Calendar -->
      <div class="tabs-container mb-6">
        <v-btn-toggle 
          v-model="tab" 
          rounded="xl" 
          color="primary" 
          divided 
          mandatory
          class="custom-tabs"
        >
          <v-btn value="week" variant="text" class="tab-button px-8 py-3">
            <v-icon class="mr-2">mdi-calendar</v-icon>
            Semaine
          </v-btn>
          <v-btn value="calendar" variant="text" class="tab-button px-8 py-3">
            <v-icon class="mr-2">mdi-calendar-month</v-icon>
            Calendrier
          </v-btn>
        </v-btn-toggle>
      </div>
  
      <div v-if="tab==='week'" class="week-view">
        <!-- Navigation des semaines -->
        <div class="week-navigation mb-6">
          <v-btn 
            icon="mdi-chevron-left" 
            variant="text" 
            @click="previousWeek"
            class="nav-button"
          />
          <div class="week-info text-center">
            <h2 class="text-h5 font-weight-bold text-primary mb-1">
              {{ formatWeekRange(planner.weekStart) }}
            </h2>
            <div class="text-body-2 text-medium-emphasis">
              Semaine {{ getWeekNumber(planner.weekStart) }}
            </div>
          </div>
          <v-btn 
            icon="mdi-chevron-right" 
            variant="text" 
            @click="nextWeek"
            class="nav-button"
          />
        </div>

        <div class="section-header mb-4">
          <h3 class="text-h6 font-weight-bold text-primary">Plan de la Semaine</h3>
          <div class="section-subtitle text-body-2 text-medium-emphasis">
            {{ items.length }} repas planifiés
          </div>
        </div>
        <div class="week-list">
          <div v-for="i in 7" :key="i" class="week-day">
            <div class="week-day-header">{{ formatDayWithDate(i - 1) }}</div>
            <div class="week-meal-line">
              <span class="label">Midi:</span>
              <span class="value ellipsis">{{ planner.plan?.[i - 1]?.lunch?.title || '-' }}</span>
            </div>
            <div class="week-meal-line">
              <span class="label">Soir:</span>
              <span class="value ellipsis">{{ planner.plan?.[i - 1]?.dinner?.title || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <div v-else class="calendar-view">
        <!-- Navigation du calendrier -->
        <div class="calendar-navigation mb-6">
          <v-btn 
            icon="mdi-chevron-left" 
            variant="text" 
            @click="previousMonth"
            class="nav-button"
          />
          <div class="month-info text-center">
            <h2 class="text-h5 font-weight-bold text-primary mb-1">
              {{ formatMonth(currentMonth) }}
            </h2>
            <div class="text-body-2 text-medium-emphasis">
              {{ currentMonth.getFullYear() }}
            </div>
          </div>
          <v-btn 
            icon="mdi-chevron-right" 
            variant="text" 
            @click="nextMonth"
            class="nav-button"
          />
        </div>

        <!-- Calendrier mensuel -->
        <v-card class="calendar-card" elevation="2">
          <v-card-text class="pa-0">
            <!-- En-têtes des jours -->
            <div class="calendar-header">
              <div 
                v-for="day in weekDays" 
                :key="day" 
                class="day-header"
              >
                {{ day }}
              </div>
            </div>
            
            <!-- Grille du calendrier -->
            <div class="calendar-grid">
              <div 
                v-for="(day, index) in calendarDaysFixed" 
                :key="index"
                class="calendar-day"
                :class="{ 
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'has-meals': day.meals.length > 0
                }"
              >
                <div class="day-number">{{ day.date.getDate() }}</div>
                <div class="day-meals">
                  <!-- Midi - toujours en premier -->
                  <div v-if="day.meals.find(m => m.type === 'lunch')" class="meal-chip lunch clickable-meal">
                    <v-menu location="top" offset="8">
                      <template #activator="{ props }">
                        <div v-bind="props" class="meal-content">
                          <span class="meal-title">{{ day.meals.find(m => m.type === 'lunch')?.title }}</span>
                          <v-icon size="12" class="ml-1">mdi-chevron-down</v-icon>
                        </div>
                      </template>
                      <v-list class="meal-menu">
                        <v-list-item @click="viewRecipe(day.meals.find(m => m.type === 'lunch')?.recipeId)">
                          <v-icon start>mdi-eye</v-icon>
                          Consulter
                        </v-list-item>
                        <v-list-item @click="openMoveDialog(day.date, 'lunch')">
                          <v-icon start>mdi-calendar-edit</v-icon>
                          Modifier la date
                        </v-list-item>
                        <v-list-item @click="modifyMenu(day.date, 'lunch')">
                          <v-icon start>mdi-food</v-icon>
                          Modifier le menu
                        </v-list-item>
                        <v-divider />
                        <v-list-item @click="removeMeal(day.date, 'lunch')" class="text-error">
                          <v-icon start>mdi-delete</v-icon>
                          Supprimer
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <div v-else class="empty-slot">
                    <v-btn 
                      size="x-small" 
                      variant="tonal" 
                      color="primary"
                      @click="selectMealSlot(day.date, 'lunch')"
                      class="meal-button"
                    >
                      <v-icon size="12" class="mr-1">mdi-plus</v-icon>
                      Midi
                    </v-btn>
                  </div>
                  
                  <!-- Soir - toujours en second -->
                  <div v-if="day.meals.find(m => m.type === 'dinner')" class="meal-chip dinner clickable-meal">
                    <v-menu location="top" offset="8">
                      <template #activator="{ props }">
                        <div v-bind="props" class="meal-content">
                          <span class="meal-title">{{ day.meals.find(m => m.type === 'dinner')?.title }}</span>
                          <v-icon size="12" class="ml-1">mdi-chevron-down</v-icon>
                        </div>
                      </template>
                      <v-list class="meal-menu">
                        <v-list-item @click="viewRecipe(day.meals.find(m => m.type === 'dinner')?.recipeId)">
                          <v-icon start>mdi-eye</v-icon>
                          Consulter
                        </v-list-item>
                        <v-list-item @click="openMoveDialog(day.date, 'dinner')">
                          <v-icon start>mdi-calendar-edit</v-icon>
                          Modifier la date
                        </v-list-item>
                        <v-list-item @click="modifyMenu(day.date, 'dinner')">
                          <v-icon start>mdi-food</v-icon>
                          Modifier le menu
                        </v-list-item>
                        <v-divider />
                        <v-list-item @click="removeMeal(day.date, 'dinner')" class="text-error">
                          <v-icon start>mdi-delete</v-icon>
                          Supprimer
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <div v-else class="empty-slot">
                    <v-btn 
                      size="x-small" 
                      variant="tonal" 
                      color="error"
                      @click="selectMealSlot(day.date, 'dinner')"
                      class="meal-button"
                    >
                      <v-icon size="12" class="mr-1">mdi-plus</v-icon>
                      Soir
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
        <!-- Dialog: Déplacer un repas -->
        <v-dialog v-model="moveDialog" max-width="480">
          <v-card rounded="xl">
            <v-card-title class="text-h6 font-weight-bold">
              Déplacer le repas
            </v-card-title>
            <v-card-text>
              <div v-if="currentRecipeToMove" class="mb-4">
                <div class="text-body-1 mb-2">
                  Sélectionnez la date et le repas cible pour déplacer « {{ currentRecipeToMove.title }} ».
                </div>
                <v-text-field
                  v-model="moveTargetDate"
                  type="date"
                  label="Date cible"
                  variant="outlined"
                  rounded="lg"
                  class="mb-4"
                />
                <v-btn-toggle v-model="moveTargetMeal" divided rounded="xl" class="mb-2">
                  <v-btn value="lunch">Midi</v-btn>
                  <v-btn value="dinner">Soir</v-btn>
                </v-btn-toggle>
                <div v-if="moveTargetDate && moveTargetMeal" class="mt-2">
                  <v-alert type="warning" variant="tonal" v-if="targetOccupiedRecipe">
                    Le créneau est occupé par « {{ targetOccupiedRecipe.title }} ». Remplacer par « {{ currentRecipeToMove.title }} » ?
                  </v-alert>
                  <v-alert type="info" variant="tonal" v-else>
                    Attribuer « {{ currentRecipeToMove.title }} » au {{ moveTargetMeal === 'lunch' ? 'midi' : 'soir' }} du {{ new Date(moveTargetDate).toLocaleDateString('fr-FR') }} ?
                  </v-alert>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="text" @click="moveDialog = false">Annuler</v-btn>
              <v-btn color="primary" :disabled="!moveTargetDate || !moveTargetMeal" @click="confirmMove">Confirmer</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-container>
  </AuthGuard>
</template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { usePlannerStore } from '~/stores/planner'
  
  const planner = usePlannerStore()
  const tab = ref<'week'|'calendar'>('week')
  const currentMonth = ref(new Date())
  const selectedMealSlot = ref<{date: Date, meal: 'lunch'|'dinner'} | null>(null)
  // Déplacement d\'un repas (dialog)
  const moveDialog = ref(false)
  const moveFrom = ref<{ date: Date; meal: 'lunch'|'dinner' } | null>(null)
  const moveTargetDate = ref<string>('') // format YYYY-MM-DD
  const moveTargetMeal = ref<'lunch'|'dinner'|null>(null)
  const toDateKey2 = (d: Date) => {
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const parseDateInput = (s: string): Date | null => {
    const parts = s.split('-')
    if (parts.length !== 3) return null
    const y = Number(parts[0]); const m = Number(parts[1]); const d = Number(parts[2])
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
    return new Date(y, m - 1, d)
  }
  const getRecipeAt = (date: Date, meal: 'lunch'|'dinner') => {
    const key = toDateKey2(date)
    const mp = planner.mealPlans.find(mp => mp.date === key && mp.meal_type === meal)
    return mp?.recipe
  }
  
  // Charger les plans de repas au montage
  onMounted(async () => {
    await planner.loadMealPlans()
  })
  
  // Recharger les plans quand on revient sur la page
  const refreshPlans = async () => {
    await planner.loadMealPlans()
  }
  
  // Ã‰couter les changements d'onglet pour recharger les données
  watch(tab, async (newTab) => {
    if (newTab === 'calendar') {
      await refreshPlans()
    }
  })
  
  // Fonction pour aller au calendrier et préparer l'ajout
  const goToCalendarAndAdd = () => {
    tab.value = 'calendar'
  }
  
  // Fonction pour sélectionner un créneau de repas
  const selectMealSlot = (date: Date, meal: 'lunch'|'dinner') => {
    selectedMealSlot.value = { date, meal }
    // Rediriger vers les recettes avec les paramètres de sélection
    navigateTo(`/recipes?selectedDate=${date.toISOString()}&selectedMeal=${meal}`)
  }
  
  // Fonctions pour le menu déroulant des repas
  const viewRecipe = (recipeId: string) => {
    if (recipeId) {
      navigateTo(`/recipes/${recipeId}`)
    }
  }
  
  const openMoveDialog = (date: Date, meal: 'lunch'|'dinner') => {
    moveFrom.value = { date, meal }
    moveTargetDate.value = ''
    moveTargetMeal.value = null
    moveDialog.value = true
  }

  const targetOccupiedRecipe = computed(() => {
    if (!moveTargetDate.value || !moveTargetMeal.value) return null
    const targetDate = parseDateInput(moveTargetDate.value)
    if (!targetDate) return null
    const key = toDateKey2(targetDate)
    const mp = planner.mealPlans.find(mp => mp.date === key && mp.meal_type === moveTargetMeal.value)
    return mp?.recipe || null
  })

  const currentRecipeToMove = computed(() => {
    const from = moveFrom.value
    if (!from) return null
    const key = toDateKey2(from.date)
    const mp = planner.mealPlans.find(mp => mp.date === key && mp.meal_type === from.meal)
    return mp?.recipe || null
  })
  const confirmMove = async () => {
    try {
      if (!moveFrom.value || !moveTargetDate.value || !moveTargetMeal.value) return
      const from = moveFrom.value
      const targetDate = parseDateInput(moveTargetDate.value)
      if (!targetDate) return
      const recipe = currentRecipeToMove.value
      if (!recipe) return
      await planner.saveMealPlan(targetDate, moveTargetMeal.value, recipe)
      const sameDate = toDateKey2(targetDate) === toDateKey2(from.date)
      const sameMeal = moveTargetMeal.value === from.meal
      if (!(sameDate && sameMeal)) {
        await planner.removeMealPlan(from.date, from.meal)
      }
      await refreshPlans()
    } catch (e) {
      console.error('Erreur déplacement repas:', e)
    } finally {
      moveDialog.value = false
    }
  }
  const modifyDate = (date: Date, meal: 'lunch'|'dinner') => {
    // TODO: Implémenter la modification de date
    console.log('Modifier la date pour:', date, meal)
  }
  
  const modifyMenu = (date: Date, meal: 'lunch'|'dinner') => {
    // Rediriger vers les recettes pour modifier le menu
    navigateTo(`/recipes?selectedDate=${date.toISOString()}&selectedMeal=${meal}&modify=true`)
  }
  
  const removeMeal = async (date: Date, meal: 'lunch'|'dinner') => {
    try {
      await planner.removeMealPlan(date, meal)
      await refreshPlans()
    } catch (error) {
      console.error('Erreur suppression repas:', error)
    }
  }
  
  // Jours de la semaine
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  
  // Navigation du calendrier
  const previousMonth = () => {
    const newDate = new Date(currentMonth.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentMonth.value = newDate
  }
  
  const nextMonth = () => {
    const newDate = new Date(currentMonth.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentMonth.value = newDate
  }
  
  // Formater le mois
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long',
      year: 'numeric'
    })
  }
  
  // Générer les jours du calendrier
  const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1)
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0)
    
    // Commencer le calendrier au lundi de la semaine contenant le 1er
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(startDate.getDate() + mondayOffset)
    
    const days = []
    const today = new Date()
    
    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === today.toDateString()
      
      // Récupérer les repas pour ce jour
      const dayOfWeek = date.getDay()
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convertir dimanche=0 à dimanche=6
      const dayPlan = planner.plan?.[dayIndex]
      
      const meals = []
      if (dayPlan) {
        if (dayPlan.lunch) {
          meals.push({
            id: `lunch-${date.getTime()}`,
            title: dayPlan.lunch.title,
            type: 'lunch',
            recipeId: dayPlan.lunch.id
          })
        }
        if (dayPlan.dinner) {
          meals.push({
            id: `dinner-${date.getTime()}`,
            title: dayPlan.dinner.title,
            type: 'dinner',
            recipeId: dayPlan.dinner.id
          })
        }
      }
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        meals
      })
    }
    
    return days
  })

  // Version basée sur les dates exactes (affichage calendrier)
  const calendarDaysFixed = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    const dow = firstDay.getDay()
    const mondayOffset = dow === 0 ? -6 : 1 - dow
    startDate.setDate(startDate.getDate() + mondayOffset)
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; meals: any[] }[] = []
    const today = new Date()
    const toDateKey = (d: Date) => {
      const y = d.getFullYear()
      const m = (d.getMonth() + 1).toString().padStart(2, '0')
      const day = d.getDate().toString().padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === today.toDateString()
      const key = toDateKey(date)
      const mealsForDay = planner.mealPlans.filter(mp => mp.date === key)
      const lunch = mealsForDay.find(m => m.meal_type === 'lunch')
      const dinner = mealsForDay.find(m => m.meal_type === 'dinner')
      const meals: any[] = []
      if (lunch) meals.push({ id: `lunch-${key}`, title: lunch.recipe.title, type: 'lunch', recipeId: lunch.recipe.id })
      if (dinner) meals.push({ id: `dinner-${key}`, title: dinner.recipe.title, type: 'dinner', recipeId: dinner.recipe.id })
      days.push({ date, isCurrentMonth, isToday, meals })
    }
    return days
  })
  
  // Fonctions de navigation des semaines
  const previousWeek = () => {
    const newDate = new Date(planner.weekStart)
    newDate.setDate(newDate.getDate() - 7)
    planner.setWeekStart(newDate)
  }
  
  const nextWeek = () => {
    const newDate = new Date(planner.weekStart)
    newDate.setDate(newDate.getDate() + 7)
    planner.setWeekStart(newDate)
  }
  
  // Formater la plage de dates de la semaine
  const formatWeekRange = (weekStart: Date) => {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      })
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`
  }
  
  // Obtenir le numéro de semaine
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }
  
  const items = computed(() => {
    const out:{id:string; title:string; meal:string; img?:string}[]=[]
    const meals = ['lunch', 'dinner'] as const
    for (let di = 0; di < 7; di++) {
      // Vérifie que planner.plan existe et que planner.plan[di] existe
      const dayPlan = planner.plan?.[di]
      if (!dayPlan) continue
      for (const m of meals) {
        const r = dayPlan?.[m]
        if (r) {
          out.push({
            id: `${di}-${m}`,
            title: r.title,
            meal: m[0]?.toUpperCase() + m.slice(1),
            img: r.img ?? `https://picsum.photos/200?${di}${m}`
          })
        }
      }
    }
    return out
  })
  const formatDayWithDate = (index: number) => {
    const d = new Date(planner.weekStart)
    d.setDate(d.getDate() + index)
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })
  }
  </script>

<style scoped>
.planner-container {
  max-width: 800px;
  margin: 0 auto;
}

.add-button {
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.add-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
}

.refresh-button {
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.refresh-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
}

.week-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border-radius: 16px;
  padding: 16px 24px;
  border: 1px solid #e9ecef;
}

.nav-button {
  transition: all 0.3s ease;
}

.nav-button:hover {
  background-color: rgba(0, 123, 255, 0.1);
  transform: scale(1.1);
}

.week-info {
  flex: 1;
}

.custom-tabs {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-button {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.section-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 12px;
}

.section-subtitle {
  margin-top: 4px;
}

.text-primary {
  color: #007bff !important;
}

.week-view {
  animation: fadeIn 0.5s ease;
}

.calendar-view {
  animation: fadeIn 0.5s ease;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border-radius: 16px;
  padding: 16px 24px;
  border: 1px solid #e9ecef;
}

.month-info {
  flex: 1;
}

.calendar-card {
  border-radius: 16px;
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  width: 100%;
  box-sizing: border-box;
  background: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}

.day-header {
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6c757d;
  border-right: 1px solid #dee2e6;
}

.day-header:last-child {
  border-right: none;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: repeat(6, 1fr);
  min-height: 420px;
  width: 100%;
  box-sizing: border-box;
}

.calendar-day {
  border-right: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  padding: 8px;
  min-height: 60px;
  position: relative;
  background: #ffffff;
  transition: background-color 0.2s ease;
}

.calendar-day:last-child {
  border-right: none;
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: #6c757d;
}

.calendar-day.today {
  background: rgba(0, 123, 255, 0.1);
  border: 2px solid #007bff;
}

.calendar-day.has-meals {
  background: rgba(40, 167, 69, 0.05);
}

.day-number {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.day-meals {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meal-chip {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 8px;
  background: #e9ecef;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.meal-chip.lunch {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.meal-chip.dinner {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.more-meals {
  font-size: 0.7rem;
  color: #6c757d;
  text-align: center;
  font-style: italic;
}

.empty-slot {
  margin: 2px 0;
}

.meal-button {
  font-size: 0.7rem;
  height: 20px;
  min-width: 50px;
  text-transform: none;
  letter-spacing: 0;
}

.clickable-meal {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-meal:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.meal-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.meal-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.week-list { display: flex; flex-direction: column; gap: 12px; }
.week-day { border: 1px solid #e9ecef; border-radius: 12px; background: #fff; padding: 12px 16px; }
.week-day-header { font-weight: 700; margin-bottom: 6px; color: #2c3e50; }
.week-meal-line { display: grid; grid-template-columns: 48px 1fr; gap: 8px; align-items: center; }
.week-meal-line .label { color: #6c757d; }

.meal-menu {
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  min-width: 180px;
}

.meal-menu .v-list-item {
  border-radius: 8px;
  margin: 4px 8px;
  min-height: 40px;
  transition: all 0.2s ease;
}

.meal-menu .v-list-item:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
  












