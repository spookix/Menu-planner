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
      {{ n.message }}
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
</style>

