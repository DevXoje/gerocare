<script setup lang="ts">
import { ref, watch } from 'vue'

const searchQuery = ref('')

const emit = defineEmits<{
  search: [query: string]
}>()

watch(searchQuery, (newValue) => {
  emit('search', newValue)
})

const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="resident-search">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Buscar por nombre o apellido..."
      class="search-input"
    />
    <button
      v-if="searchQuery"
      @click="clearSearch"
      class="clear-button"
      aria-label="Limpiar búsqueda"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.resident-search {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.clear-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.25rem;
  line-height: 1;
  transition: color 0.2s;
}

.clear-button:hover {
  color: #111827;
}
</style>

