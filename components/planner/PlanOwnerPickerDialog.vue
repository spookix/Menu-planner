<template>
  <v-dialog v-model="model" max-width="520">
    <v-card rounded="xl">
      <v-card-title class="font-weight-bold">Choisir un planning</v-card-title>
      <v-card-text>
        <v-radio-group v-model="selected">
          <v-radio :value="ownId" :label="`Mon planning`" />
          <template v-if="owners.length">
            <div class="text-subtitle-2 mt-2 mb-1">Plannings partagés</div>
            <v-radio v-for="o in owners" :key="o.id" :value="o.id" :label="o.username || o.id" />
          </template>
        </v-radio-group>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close">Annuler</v-btn>
        <v-btn color="primary" @click="apply">Utiliser</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { usePlannerStore } from '~/stores/planner'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'changed'): void }>()

const planner = usePlannerStore()
const auth = useAuthStore()

const model = ref(props.modelValue)
watch(() => props.modelValue, v => (model.value = v))
watch(model, v => emit('update:modelValue', v))

const owners = computed(() => planner.sharedOwners)
const ownId = computed(() => auth.userId || '')
const selected = ref<string>('')

onMounted(async () => {
  await planner.loadSharedOwners()
  selected.value = planner.activeOwnerId || ownId.value
})

watch(model, async (open) => {
  if (open) {
    await planner.loadSharedOwners()
    if (!selected.value) selected.value = planner.activeOwnerId || ownId.value
  }
})

const close = () => { model.value = false }
const apply = async () => {
  const ownerId = selected.value
  if (ownerId === ownId.value) {
    planner.setActiveOwner(null, auth.username || null)
  } else {
    const found = owners.value.find(o => o.id === ownerId)
    planner.setActiveOwner(ownerId, found?.username || null)
  }
  await planner.loadMealPlans()
  emit('changed')
  close()
}
</script>

<style scoped>
</style>
