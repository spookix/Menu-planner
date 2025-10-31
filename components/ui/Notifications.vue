<template>
  <div class="notifications-wrapper">
    <v-snackbar
      v-for="n in ui.notifications"
      :key="n.id"
      v-model="visible[n.id]"
      :timeout="n.timeout ?? 5000"
      location="top right"
      :color="n.color || 'info'"
      rounded="lg"
      elevation="8"
      class="mb-2"
      @update:model-value="(v:boolean) => { if(!v) ui.remove(n.id) }"
    >
      <div class="snack-content">
        <div class="snack-title">{{ n.message }}</div>
        <div v-if="n.subtext" class="snack-subtext">{{ n.subtext }}</div>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
const visible = reactive<Record<number, boolean>>({})

watchEffect(() => {
  for (const n of ui.notifications) {
    if (visible[n.id] === undefined) visible[n.id] = true
  }
})
</script>

<style scoped>
.notifications-wrapper {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9999;
}
.snack-content { display: flex; flex-direction: column; }
.snack-title { font-weight: 600; }
.snack-subtext { opacity: 0.9; font-size: 0.875rem; margin-top: 2px; }
</style>
