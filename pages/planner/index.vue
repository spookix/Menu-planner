<template>
    <v-container class="py-4 planner-container">
      <!-- Header avec titre et bouton d'ajout -->
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold text-primary">Planificateur de Repas</h1>
        <v-btn 
          color="primary" 
          icon 
          size="large"
          elevation="4"
          @click="$router.push('/recipes')" 
          class="add-button"
        >
          <v-icon size="28">mdi-plus</v-icon>
        </v-btn>
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
        <div class="section-header mb-4">
          <h2 class="text-h5 font-weight-bold text-primary">Cette Semaine</h2>
          <div class="section-subtitle text-body-2 text-medium-emphasis">
            {{ items.length }} repas planifiés
          </div>
        </div>
        <PlannerList :items="items" />
      </div>
  
      <div v-else class="calendar-view">
        <div class="text-center py-8">
          <v-icon size="64" color="primary" class="mb-4">mdi-calendar</v-icon>
          <h3 class="text-h5 font-weight-medium mb-2">Vue Calendrier</h3>
          <p class="text-body-1 text-medium-emphasis">Bientôt disponible ! 🚀</p>
        </div>
      </div>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { usePlannerStore } from '~/stores/planner'
  
  const planner = usePlannerStore()
  const tab = ref<'week'|'calendar'>('week')
  
  const items = computed(() => {
    const out:{id:string; title:string; meal:string; img?:string}[]=[]
    const meals = ['breakfast', 'lunch', 'dinner'] as const
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

.tabs-container {
  display: flex;
  justify-content: center;
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
  