<template>
  <v-dialog v-model="model" max-width="1200">
    <v-card rounded="xl" class="dialog-card">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <v-icon color="primary" class="mr-2">mdi-calendar-month</v-icon>
          <span class="text-h6 font-weight-bold">Ajouter au plan</span>
        </div>
        <div class="d-flex align-center">
          <v-btn icon variant="text" @click="prevMonth" class="mr-1"><v-icon>mdi-chevron-left</v-icon></v-btn>
          <div class="text-subtitle-1 mx-2">{{ formatMonth(currentMonth) }}</div>
          <v-btn icon variant="text" @click="nextMonth" class="ml-1"><v-icon>mdi-chevron-right</v-icon></v-btn>
        </div>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div class="calendar">
          <div class="calendar-header">
            <div v-for="w in weekDays" :key="w" class="calendar-header-cell">{{ w }}</div>
          </div>
          <div class="calendar-grid">
            <div 
              v-for="d in calendarDays" 
              :key="d.date.toISOString()"
              class="calendar-cell"
              :class="{ 'other-month': !d.isCurrentMonth, today: d.isToday }"
            >
              <div class="cell-date">{{ d.date.getDate() }}</div>
              <div class="cell-slot" @click="handlePick(d.date, 'lunch', $event)">
                <div class="slot-label">
                  <v-icon x-small class="mr-1">mdi-white-balance-sunny</v-icon>
                  Midi
                </div>
                <div class="slot-value ellipsis" :class="{ empty: !getMeal(d.date, 'lunch') }">
                  {{ getMeal(d.date, 'lunch')?.recipe.title || '-' }}
                </div>
              </div>
              <div class="cell-slot" @click="handlePick(d.date, 'dinner', $event)">
                <div class="slot-label">
                  <v-icon x-small class="mr-1">mdi-moon-waning-crescent</v-icon>
                  Soir
                </div>
                <div class="slot-value ellipsis" :class="{ empty: !getMeal(d.date, 'dinner') }">
                  {{ getMeal(d.date, 'dinner')?.recipe.title || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showConflict" max-width="420">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold">Emplacement occupé</v-card-title>
      <v-card-text>
        Un repas est déjà planifié à cet emplacement. Voulez-vous le remplacer ?
      </v-card-text>
      <v-card-actions class="d-flex flex-column">
        <v-btn block color="primary" class="mb-2" @click="confirmReplace">Remplacer</v-btn>
        <v-btn block variant="text" @click="cancelConflict">Annuler</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { Recipe } from '~/lib/supabase'
import { usePlannerStore, type MealKey } from '~/stores/planner'
import { useUiStore } from '~/stores/ui'

const props = defineProps<{ modelValue: boolean; recipe: Recipe | null }>()
const emit = defineEmits<{ (e:'update:modelValue', v:boolean):void; (e:'saved'):void }>()

const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const ui = useUiStore()
const planner = usePlannerStore()

const currentMonth = ref(new Date())

const close = () => { model.value = false }

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const formatMonth = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
const prevMonth = () => { const x = new Date(currentMonth.value); x.setMonth(x.getMonth() - 1); currentMonth.value = x }
const nextMonth = () => { const x = new Date(currentMonth.value); x.setMonth(x.getMonth() + 1); currentMonth.value = x }

const toDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const first = new Date(year, month, 1)
  const start = new Date(first)
  const dow = first.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  start.setDate(start.getDate() + offset)
  const today = new Date()
  const arr: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    arr.push({ date: d, isCurrentMonth: d.getMonth() === month, isToday: d.toDateString() === today.toDateString() })
  }
  return arr
})

const getMeal = (date: Date, meal: MealKey) => {
  const key = toDateKey(date)
  return planner.mealPlans.find(mp => mp.date === key && mp.meal_type === meal) || null
}

const pendingPick = ref<{ date: Date; meal: MealKey } | null>(null)
const showConflict = ref(false)

const handlePick = (date: Date, meal: MealKey, _evt: MouseEvent) => {
  if (!props.recipe) return
  const existing = getMeal(date, meal)
  if (existing) {
    pendingPick.value = { date, meal }
    showConflict.value = true
  } else {
    doSave(date, meal)
  }
}

const doSave = async (date: Date, meal: MealKey) => {
  if (!props.recipe) return
  try {
    await planner.saveMealPlan(date, meal, props.recipe)
    ui.notify('Recette ajoutée au plan', { color: 'success' })
    emit('saved')
    close()
  } catch (e: any) {
    ui.notify(e.message || "Erreur lors de l'ajout au plan", { color: 'error' })
  }
}

const confirmReplace = async () => {
  if (!pendingPick.value) return
  const { date, meal } = pendingPick.value
  showConflict.value = false
  await doSave(date, meal)
  pendingPick.value = null
}
const cancelConflict = () => { showConflict.value = false; pendingPick.value = null }

onMounted(async () => {
  if (!planner.mealPlans.length) {
    await planner.loadMealPlans()
  }
})

watch(() => model.value, async (open) => {
  if (open) {
    await planner.loadMealPlans()
  }
})
</script>

<style scoped>
.dialog-card { width: min(1200px, 96vw); }
.dialog-card :deep(.v-card-text) { overflow-x: hidden; }
.calendar { width: 100%; }
.calendar-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 8px 8px 0; }
.calendar-header-cell { text-align: center; font-weight: 600; color: #6c757d; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; padding: 8px; }
.calendar-cell { border: 1px solid #e9ecef; border-radius: 12px; padding: 8px; min-height: 120px; background: #fff; display: flex; flex-direction: column; gap: 6px; }
.calendar-cell.other-month { opacity: 0.6; }
.calendar-cell.today { border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.15) inset; }
.cell-date { font-weight: 700; color: #2c3e50; }
.cell-slot { padding: 6px; border-radius: 10px; transition: background 0.15s ease; cursor: pointer; }
.cell-slot:hover { background: #f5f9ff; }
.slot-label { font-size: 12px; color: #6c757d; display: flex; align-items: center; }
.slot-value { font-size: 14px; color: #2c3e50; }
.slot-value.empty { color: #adb5bd; font-style: italic; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>

