import { ref, computed } from 'vue'
import { createResidentRepository } from '../infrastructure'
import type { Resident } from '../domain/Resident'
import type { ResidentError } from '../domain/ResidentErrors'
import { useAuthStore } from '@/business/auth/store'

const repository = createResidentRepository()

export function useResidents() {
  const authStore = useAuthStore()
  const residents = ref<Resident[]>([])
  const resident = ref<Resident | null>(null)
  const searchResults = ref<Resident[]>([])
  const isLoading = ref(false)
  const error = ref<ResidentError | null>(null)

  const loadResidents = async () => {
    if (!authStore.user) {
      error.value = { code: 'AUTH_ERROR', message: 'User not authenticated' }
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findByCaregiver(authStore.user.uid)
      
      if (result.success) {
        residents.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load residents' }
    } finally {
      isLoading.value = false
    }
  }

  const loadResident = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findById(id)
      
      if (result.success) {
        resident.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load resident' }
    } finally {
      isLoading.value = false
    }
  }

  const searchResidents = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await repository.search(query)
      
      if (result.success) {
        searchResults.value = result.value
      } else {
        error.value = result.error
        searchResults.value = []
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to search residents' }
      searchResults.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    residents: computed(() => residents.value),
    resident: computed(() => resident.value),
    searchResults: computed(() => searchResults.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadResidents,
    loadResident,
    searchResidents,
  }
}

