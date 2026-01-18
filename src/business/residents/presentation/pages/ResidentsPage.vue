<script setup lang="ts">
import { computed,onMounted, ref } from 'vue'

import AppButton from '@/business/common/presentation/atoms/Button.vue'

import { useResidents } from '../../app/useResidents'
import CreateResidentModal from '../components/CreateResidentModal.vue'
import ResidentList from '../components/ResidentList.vue'
import ResidentSearch from '../components/ResidentSearch.vue'

const { residents, loadResidents, searchResidents, isLoading, error } = useResidents()
const searchQuery = ref('')
const isModalOpen = ref(false)

const displayedResidents = computed(() => {
  if (searchQuery.value.trim()) {
    // In a real implementation, this would use searchResults from useResidents
    // For now, we'll filter locally
    const query = searchQuery.value.toLowerCase()
    return residents.value.filter(
      r =>
        r.firstName.toLowerCase().includes(query) ||
        r.lastName.toLowerCase().includes(query)
    )
  }
  return residents.value
})

const handleSearch = (query: string) => {
  searchQuery.value = query
  if (query.trim()) {
    searchResidents(query)
  }
}

const handleCreateSuccess = () => {
  loadResidents()
}

onMounted(() => {
  loadResidents()
})
</script>

<template>
  <div class="residents-page">
    <div class="page-header">
      <h1 class="page-title">Residentes</h1>
      <div class="page-header__actions">
        <ResidentSearch @search="handleSearch" />
        <AppButton @click="isModalOpen = true">
          ➕ Nuevo Residente
        </AppButton>
      </div>
    </div>

    <ResidentList :residents="displayedResidents" :is-loading="isLoading" :error="error?.message" />

    <CreateResidentModal v-model:is-open="isModalOpen" @success="handleCreateSuccess" />
  </div>
</template>

<style scoped>
.residents-page {
  width: 100%;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .residents-page {
    padding: 2rem;
  }
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-header__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

@media (min-width: 768px) {
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .page-header__actions {
    flex-direction: row;
    align-items: center;
    width: auto;
    gap: 1rem;
  }
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
}

@media (max-width: 767px) {
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
