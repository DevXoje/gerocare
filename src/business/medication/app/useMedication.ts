import { computed,ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'

import type { Medication, MedicationAdministration } from '../domain/Medication'
import type { MedicationError } from '../domain/MedicationErrors'
import { createMedicationRepository } from '../infrastructure'

const repository = createMedicationRepository()

export function useMedication() {
  const authStore = useAuthStore()
  const medications = ref<Medication[]>([])
  const medication = ref<Medication | null>(null)
  const administrations = ref<MedicationAdministration[]>([])
  const isLoading = ref(false)
  const error = ref<MedicationError | null>(null)

  const loadMedications = async (residentId?: string) => {
    if (residentId) {
      return loadMedicationsByResident(residentId)
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findAll()

      if (result.success) {
        medications.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load medications' }
    } finally {
      isLoading.value = false
    }
  }

  const loadMedicationsByResident = async (residentId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findByResident(residentId)

      if (result.success) {
        medications.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load medications' }
    } finally {
      isLoading.value = false
    }
  }

  const loadMedication = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findById(id)

      if (result.success) {
        medication.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load medication' }
    } finally {
      isLoading.value = false
    }
  }

  const loadAdministrationHistory = async (medicationId?: string, residentId?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = medicationId
        ? await repository.getAdministrationHistory(medicationId)
        : residentId
          ? await repository.getResidentAdministrationHistory(residentId)
          : { success: false as const, error: { code: 'INVALID_PARAMS', message: 'medicationId or residentId required' } }

      if (result.success) {
        administrations.value = result.value
      } else {
        error.value = result.error
        administrations.value = []
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load administration history' }
      administrations.value = []
    } finally {
      isLoading.value = false
    }
  }

  const recordAdministration = async (
    medicationId: string,
    residentId: string,
    notes?: string
  ): Promise<MedicationAdministration | null> => {
    if (!authStore.user) {
      error.value = { code: 'AUTH_ERROR', message: 'User not authenticated' }
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const administration = {
        medicationId,
        residentId,
        administeredAt: new Date(),
        administeredBy: authStore.user.uid,
        notes,
        status: 'administered' as const,
      }

      const result = await repository.recordAdministration(administration)

      if (result.success) {
        administrations.value.unshift(result.value)
        return result.value
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to record administration' }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteMedication = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.delete(id)

      if (result.success) {
        medications.value = medications.value.filter((m) => m.id !== id)
        if (medication.value?.id === id) {
          medication.value = null
        }
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to delete medication' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    medications: computed(() => medications.value),
    medication: computed(() => medication.value),
    administrations: computed(() => administrations.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadMedications,
    loadMedicationsByResident,
    loadMedication,
    loadAdministrationHistory,
    recordAdministration,
    deleteMedication,
  }
}
