<template>
  <v-dialog v-model="model" max-width="1200" content-class="plan-dialog-content">
    <v-card rounded="xl" class="dialog-card">
      <v-card-title class="dialog-header">
        <div class="title-row">
          <v-icon color="primary" class="mr-2">mdi-calendar-month</v-icon>
          <span class="title-text">Ajouter au plan</span>
        </div>
        <div class="month-row">
          <v-btn icon variant="text" @click="prevMonth" class="mr-1"><v-icon>mdi-chevron-left</v-icon></v-btn>
          <div class="month-label">{{ formatMonth(currentMonth) }}</div>
          <v-btn icon variant="text" @click="nextMonth" class="ml-1"><v-icon>mdi-chevron-right</v-icon></v-btn>
        </div>
      </v-card-title>
      <v-divider />
      <v-card-text class="dialog-body">
        <!-- Desktop/tablette: grille mensuelle -->
        <div class="calendar desktop-only">
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
              <div class="cell-slot" :class="{ empty: !getMeal(d.date, 'lunch') }" @click="handlePick(d.date, 'lunch', $event)">
                <div class="slot-label">
                  <v-icon x-small class="mr-1">mdi-white-balance-sunny</v-icon>
                  Midi
                </div>
                <div class="slot-value ellipsis" :class="{ empty: !getMeal(d.date, 'lunch') }">
                  {{ getMeal(d.date, 'lunch')?.recipe.title || '-' }}
                </div>
              </div>
              <div class="cell-slot" :class="{ empty: !getMeal(d.date, 'dinner') }" @click="handlePick(d.date, 'dinner', $event)">
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

        <!-- Mobile: semaines repliables verticales -->
        <div class="mobile-weeks mobile-only">
          <div 
            v-for="(week, wi) in mobileWeeks" 
            :key="week.start.toISOString()" 
            class="week-panel"
          >
            <button class="week-header" @click="toggleWeek(wi)">
              <v-icon size="18" class="mr-2">{{ expandedWeek === wi ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
              {{ formatWeekRange(week.start) }}
            </button>
            <div v-show="expandedWeek === wi" class="week-days">
              <div v-for="d in week.days" :key="d.toISOString()" class="day-row">
                <div class="day-date">{{ d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }) }}</div>
                <div class="day-slots">
                  <div class="slot-item" :class="{ empty: !getMeal(d, 'lunch') }" @click="handlePick(d, 'lunch', $event)">
                    <div class="slot-label"><v-icon x-small class="mr-1">mdi-white-balance-sunny</v-icon> Midi</div>
                    <div class="slot-value ellipsis" :class="{ empty: !getMeal(d, 'lunch') }">{{ getMeal(d, 'lunch')?.recipe.title || '-' }}</div>
                  </div>
                  <div class="slot-item" :class="{ empty: !getMeal(d, 'dinner') }" @click="handlePick(d, 'dinner', $event)">
                    <div class="slot-label"><v-icon x-small class="mr-1">mdi-moon-waning-crescent</v-icon> Soir</div>
                    <div class="slot-value ellipsis" :class="{ empty: !getMeal(d, 'dinner') }">{{ getMeal(d, 'dinner')?.recipe.title || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="dialog-actions justify-end">
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

// Découper en semaines pour le mode mobile
const mobileWeeks = computed(() => {
  const days = calendarDays.value
  const weeks: { start: Date; days: Date[] }[] = []
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7)
    if (slice.length) weeks.push({ start: slice[0].date, days: slice.map(d => d.date) })
  }
  return weeks
})

const expandedWeek = ref(0)
const toggleWeek = (wi: number) => {
  expandedWeek.value = expandedWeek.value === wi ? -1 : wi
}

const formatWeekRange = (start: Date) => {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const f = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  return `Semaine du ${f(start)} au ${f(end)}`
}

watch(currentMonth, () => { expandedWeek.value = 0 })

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
.dialog-header { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.title-row { display: flex; align-items: center; justify-content: center; width: 100%; }
.title-text { font-size: 1.1rem; font-weight: 700; }
.month-row { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; }
.month-label { font-weight: 600; }
.plan-dialog-content { width: 100vw !important; max-width: 100vw !important; margin: 0 !important; }
.dialog-card { width: min(1200px, 96vw); }
.dialog-body { overflow-x: hidden; }
.calendar { width: 100%; }
.calendar-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 8px 8px 0; }
.calendar-header-cell { text-align: center; font-weight: 600; color: #6c757d; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; padding: 8px; }
.calendar-cell { border: 1px solid #e9ecef; border-radius: 12px; padding: 8px; min-height: 120px; background: #fff; display: flex; flex-direction: column; gap: 6px; }
.calendar-cell.other-month { opacity: 0.6; }
.calendar-cell.today { border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.15) inset; }
.cell-date { font-weight: 700; color: #2c3e50; }
.cell-slot { padding: 6px; border-radius: 10px; transition: background 0.15s ease; cursor: pointer; }
.cell-slot.empty { background: #f8f9fb; }
.cell-slot:not(.empty):hover { background: transparent; }
.slot-label { font-size: 12px; color: #6c757d; display: flex; align-items: center; }
.slot-value { font-size: 14px; color: #2c3e50; }
.slot-value.empty { color: #adb5bd; font-style: italic; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Mobile-first adjustments */
@media (max-width: 600px) {
  .plan-dialog-content { width: 100vw !important; max-width: 100vw !important; margin: 0 !important; }
  .dialog-card { width: 100%; max-width: 100%; border-radius: 0 !important; box-sizing: border-box; }
  .title-text { font-size: 1.05rem; }
  .month-label { font-size: 0.95rem; }
  .dialog-body { padding: 8px !important; }
  .calendar-header { gap: 6px; padding: 6px 6px 0; }
  .calendar-header-cell { font-size: 12px; }
  .calendar-grid { gap: 6px; padding: 6px; }
  .calendar-cell { padding: 6px; min-height: 96px; border-radius: 10px; }
  .cell-date { font-size: 12px; }
  .slot-label { font-size: 11px; }
  .slot-value { font-size: 12px; }
  .dialog-actions { padding: 8px 12px !important; }
  .desktop-only { display: none; }
  .mobile-only { display: block; }
  .mobile-weeks { display: grid; }
}

/* Desktop hides mobile list */
@media (min-width: 601px) {
  .desktop-only { display: block; }
  .mobile-only { display: none; }
}

/* Mobile weeks */
.mobile-weeks { gap: 8px; max-width: 100%; }
.week-header { width: 100%; text-align: left; background: transparent; border: 1px solid #e9ecef; padding: 10px 12px; border-radius: 12px; font-weight: 600; display: flex; align-items: center; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.week-days { border-left: 2px solid #e9ecef; margin-left: 10px; padding-left: 10px; }
.day-row { padding: 8px 0; border-bottom: 1px dashed #e9ecef; }
.day-row:last-child { border-bottom: none; }
.day-date { font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
.day-slots { display: grid; gap: 6px; }
.slot-item { border: 1px solid #e9ecef; border-radius: 10px; padding: 8px; }
.slot-item.empty { background: #f8f9fb; }
</style>

