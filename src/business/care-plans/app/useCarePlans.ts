import { computed,ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'

import type { CarePlan, CarePlanActivity } from '../domain/CarePlan'
import type { CarePlanError } from '../domain/CarePlanErrors'
import { createCarePlanRepository } from '../infrastructure'

const repository = createCarePlanRepository()

export function useCarePlans() {
  const authStore = useAuthStore()
  const carePlans = ref<CarePlan[]>([])
  const carePlan = ref<CarePlan | null>(null)
  const activities = ref<CarePlanActivity[]>([])
  const isLoading = ref(false)
  const error = ref<CarePlanError | null>(null)

  const loadCarePlans = async (residentId?: string, activeOnly?: boolean) => {
    isLoading.value = true
    error.value = null

    try {
      const result = residentId
        ? activeOnly
          ? await repository.findActiveByResident(residentId)
          : await repository.findByResident(residentId)
        : await repository.findAll()

      if (result.success) {
        carePlans.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load care plans' }
    } finally {
      isLoading.value = false
    }
  }

  const loadCarePlan = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findById(id)

      if (result.success) {
        carePlan.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load care plan' }
    } finally {
      isLoading.value = false
    }
  }

  const loadActivityHistory = async (carePlanId?: string, residentId?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = carePlanId
        ? await repository.getActivityHistory(carePlanId)
        : residentId
          ? await repository.getResidentActivityHistory(residentId)
          : { success: false as const, error: { code: 'INVALID_PARAMS', message: 'carePlanId or residentId required' } }

      if (result.success) {
        activities.value = result.value
      } else {
        error.value = result.error
        activities.value = []
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load activity history' }
      activities.value = []
    } finally {
      isLoading.value = false
    }
  }

  const recordActivity = async (
    carePlanId: string,
    residentId: string,
    activityDate: Date,
    notes?: string,
    status: 'completed' | 'skipped' = 'completed'
  ): Promise<CarePlanActivity | null> => {
    if (!authStore.user) {
      error.value = { code: 'AUTH_ERROR', message: 'User not authenticated' }
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const activity = {
        carePlanId,
        residentId,
        activityDate,
        completedBy: status === 'completed' ? authStore.user.uid : undefined,
        completedAt: status === 'completed' ? new Date() : undefined,
        notes,
        status,
      }

      const result = await repository.recordActivity(activity)

      if (result.success) {
        activities.value.unshift(result.value)
        return result.value
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to record activity' }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteCarePlan = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.delete(id)

      if (result.success) {
        carePlans.value = carePlans.value.filter((cp) => cp.id !== id)
        if (carePlan.value?.id === id) {
          carePlan.value = null
        }
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to delete care plan' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    carePlans: computed(() => carePlans.value),
    carePlan: computed(() => carePlan.value),
    activities: computed(() => activities.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadCarePlans,
    loadCarePlan,
    loadActivityHistory,
    recordActivity,
    deleteCarePlan,
  }
}
