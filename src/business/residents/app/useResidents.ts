import { computed,ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'

import type { Resident } from '../domain/Resident'
import type { ResidentError } from '../domain/ResidentErrors'
import { createResidentRepository } from '../infrastructure'

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

  const createResident = async (residentData: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user) {
      error.value = { code: 'AUTH_ERROR', message: 'User not authenticated' }
      return { success: false as const, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      // Add current user as assigned caregiver if not already included
      const residentWithCaregiver = {
        ...residentData,
        assignedCaregivers: residentData.assignedCaregivers.includes(authStore.user.uid)
          ? residentData.assignedCaregivers
          : [...residentData.assignedCaregivers, authStore.user.uid],
      }

      const result = await repository.create(residentWithCaregiver)

      if (result.success) {
        // Reload residents list to include the new resident
        await loadResidents()
        return { success: true as const, value: result.value }
      } else {
        error.value = result.error
        return { success: false as const, error: result.error }
      }
    } catch (err) {
      const errorMsg = { code: 'UNKNOWN_ERROR' as const, message: 'Failed to create resident' }
      error.value = errorMsg
      return { success: false as const, error: errorMsg }
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
    createResident,
  }
}

