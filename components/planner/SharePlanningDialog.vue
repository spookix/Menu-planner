<template>
  <v-dialog v-model="model" max-width="520">
    <v-card rounded="xl">
      <v-card-title class="font-weight-bold">Partager mon planning</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>
        <v-text-field
          v-model="email"
          label="Email de l'utilisateur"
          type="email"
          :disabled="loading"
          prepend-inner-icon="mdi-email"
          hide-details
          autofocus
        />
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close" :disabled="loading">Annuler</v-btn>
        <v-btn color="primary" @click="share" :loading="loading">Partager</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlannerStore } from '~/stores/planner'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'shared'): void }>()

const planner = usePlannerStore()
const model = ref(props.modelValue)
watch(() => props.modelValue, v => (model.value = v))
watch(model, v => emit('update:modelValue', v))

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const close = () => { model.value = false; email.value = ''; error.value = null }

const share = async () => {
  error.value = null
  if (!email.value.trim()) { error.value = 'Veuillez saisir un email'; return }
  loading.value = true
  try {
    await planner.sharePlanningWith(email.value)
    close()
    emit('shared')
  } catch (e: any) {
    error.value = e.message || 'Impossible de partager le planning'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>

