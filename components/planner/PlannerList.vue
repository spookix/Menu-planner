<template>
  <div class="planner-list">
    <div v-for="it in items" :key="it.id" class="meal-card mb-3">
      <v-card class="meal-card-content" elevation="3" rounded="xl">
        <div class="d-flex align-center pa-4">
          <div class="meal-image-container mr-4">
            <v-img 
              :src="it.img" 
              width="80" 
              height="80" 
              cover 
              class="rounded-lg meal-image" 
            />
          </div>
          <div class="flex-grow-1">
            <div class="text-h6 font-weight-bold mb-1 text-primary">{{ it.title }}</div>
            <div class="meal-type-badge">
              <v-chip 
                size="small" 
                color="primary" 
                variant="tonal" 
                class="text-caption font-weight-medium"
              >
                {{ it.meal }}
              </v-chip>
            </div>
          </div>
          <v-btn 
            icon 
            variant="text" 
            color="primary"
            class="ml-2"
          >
            <v-icon size="24">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { id:string; title:string; meal:string; img?:string }[] }>()
</script>

<style scoped>
.planner-list {
  padding: 0 4px;
}

.meal-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.meal-card:hover {
  transform: translateY(-2px);
}

.meal-card-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.meal-card-content:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.meal-image-container {
  position: relative;
}

.meal-image {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.meal-card:hover .meal-image {
  transform: scale(1.05);
}

.meal-type-badge {
  margin-top: 4px;
}

.text-h6 {
  line-height: 1.3;
  color: #2c3e50;
}

.text-primary {
  color: #007bff !important;
}
</style>
