<script setup lang="ts">
import { computed, onMounted,ref } from 'vue'
import { useRoute } from 'vue-router'

import Button from '@/business/common/presentation/atoms/Button.vue'
import Card from '@/business/common/presentation/atoms/Card.vue'
import Tabs from '@/business/common/presentation/molecules/Tabs.vue'

import { useCarePlanForm } from '../../app/useCarePlanForm'
import { useCarePlans } from '../../app/useCarePlans'
import type { CarePlan } from '../../domain/CarePlan'
import CarePlanForm from '../components/CarePlanForm.vue'
import CarePlanList from '../components/CarePlanList.vue'

const route = useRoute()
const residentId = computed(() => (route.params.residentId as string) || undefined)

const { carePlans, isLoading, error, loadCarePlans } = useCarePlans()
const { resetForm } = useCarePlanForm()

const showForm = ref(false)
const activeTab = ref('all')

const activeCarePlans = computed(() => {
  return carePlans.value.filter((cp) => cp.status === 'active')
})

const displayedCarePlans = computed(() => {
  if (activeTab.value === 'active') {
    return activeCarePlans.value
  }
  return carePlans.value
})

const tabs = [
  { id: 'all', label: 'Todos', count: carePlans.value.length },
  { id: 'active', label: 'Activos', count: activeCarePlans.value.length },
]

onMounted(async () => {
  await loadCarePlans(residentId.value)
})

const handleCreateClick = () => {
  resetForm()
  if (residentId.value) {
    resetForm()
  }
  showForm.value = true
}

const handleFormSubmit = async () => {
  await loadCarePlans(residentId.value)
}

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}
</script>

<template>
  <div class="care-plans-page">
    <div class="care-plans-page__header">
      <div>
        <h1 class="care-plans-page__title">Planes de Atención Individual (PAI)</h1>
        <p v-if="residentId" class="care-plans-page__subtitle">Residente ID: {{ residentId }}</p>
      </div>
      <Button variant="primary" @click="handleCreateClick">Nuevo PAI</Button>
    </div>

    <Card variant="elevated" padding="md" class="care-plans-page__content">
      <Tabs :model-value="activeTab" :tabs="tabs" @change="handleTabChange" />

      <div class="care-plans-page__list">
        <CarePlanList :care-plans="displayedCarePlans" :is-loading="isLoading" :error="error?.message || null" clickable />
      </div>
    </Card>

    <CarePlanForm
      v-model="showForm"
      :resident-id="residentId"
      @submit="handleFormSubmit"
      @close="showForm = false"
    />
  </div>
</template>

<style scoped>
.care-plans-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.care-plans-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.care-plans-page__title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.care-plans-page__subtitle {
  margin: var(--spacing-xs) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.care-plans-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.care-plans-page__list {
  margin-top: var(--spacing-lg);
}
</style>
