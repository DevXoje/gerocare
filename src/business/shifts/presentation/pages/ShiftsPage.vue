<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import Button from '@/business/common/presentation/atoms/Button.vue'
import Card from '@/business/common/presentation/atoms/Card.vue'
import Tabs from '@/business/common/presentation/molecules/Tabs.vue'

import { useShiftForm } from '../../app/useShiftForm'
import { useShifts } from '../../app/useShifts'
import type { Shift } from '../../domain/Shift'
import ShiftForm from '../components/ShiftForm.vue'
import ShiftList from '../components/ShiftList.vue'

const route = useRoute()
const caregiverId = computed(() => (route.params.caregiverId as string) || undefined)

const { shifts, isLoading, error, loadShifts } = useShifts()
const { resetForm } = useShiftForm()

const showForm = ref(false)
const activeTab = ref('all')

const scheduledShifts = computed(() => {
  return shifts.value.filter((s) => s.status === 'scheduled' || s.status === 'in-progress')
})

const displayedShifts = computed(() => {
  if (activeTab.value === 'scheduled') {
    return scheduledShifts.value
  }
  return shifts.value
})

const tabs = [
  { id: 'all', label: 'Todos', count: shifts.value.length },
  { id: 'scheduled', label: 'Programados', count: scheduledShifts.value.length },
]

onMounted(async () => {
  await loadShifts(caregiverId.value)
})

const handleCreateClick = () => {
  resetForm()
  if (caregiverId.value) {
    resetForm()
  }
  showForm.value = true
}

const handleFormSubmit = async () => {
  await loadShifts(caregiverId.value)
}

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}
</script>

<template>
  <div class="shifts-page">
    <div class="shifts-page__header">
      <div>
        <h1 class="shifts-page__title">Gestión de Turnos</h1>
        <p v-if="caregiverId" class="shifts-page__subtitle">Cuidador ID: {{ caregiverId }}</p>
      </div>
      <Button variant="primary" @click="handleCreateClick">Programar Turno</Button>
    </div>

    <Card variant="elevated" padding="md" class="shifts-page__content">
      <Tabs :model-value="activeTab" :tabs="tabs" @change="handleTabChange" />

      <div class="shifts-page__list">
        <ShiftList :shifts="displayedShifts" :is-loading="isLoading" :error="error?.message || null" clickable />
      </div>
    </Card>

    <ShiftForm v-model="showForm" :caregiver-id="caregiverId" @submit="handleFormSubmit" @close="showForm = false" />
  </div>
</template>

<style scoped>
.shifts-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.shifts-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.shifts-page__title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.shifts-page__subtitle {
  margin: var(--spacing-xs) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.shifts-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.shifts-page__list {
  margin-top: var(--spacing-lg);
}
</style>
