import { computed, ref } from 'vue'

import type { ActivityLog } from '../domain/ActivityLog'
import type { ActivityLogError } from '../domain/ActivityLogErrors'
import { createActivityLogRepository } from '../infrastructure'

const repository = createActivityLogRepository()

export function useActivityLogs() {
  const activityLogs = ref<ActivityLog[]>([])
  const activityLog = ref<ActivityLog | null>(null)
  const isLoading = ref(false)
  const error = ref<ActivityLogError | null>(null)

  const loadActivityLogs = async (residentId?: string, caregiverId?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = residentId
        ? await repository.findByResident(residentId)
        : caregiverId
          ? await repository.findByCaregiver(caregiverId)
          : await repository.findAll()

      if (result.success) {
        activityLogs.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'REPOSITORY_ERROR', message: 'Failed to load activity logs' }
    } finally {
      isLoading.value = false
    }
  }

  const loadActivityLog = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findById(id)

      if (result.success) {
        activityLog.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'REPOSITORY_ERROR', message: 'Failed to load activity log' }
    } finally {
      isLoading.value = false
    }
  }

  const loadByDateRange = async (residentId: string, startDate: Date, endDate: Date) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findByResidentAndDateRange(residentId, startDate, endDate)

      if (result.success) {
        activityLogs.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'REPOSITORY_ERROR', message: 'Failed to load activity logs by date range' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteActivityLog = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.delete(id)

      if (result.success) {
        activityLogs.value = activityLogs.value.filter((log) => log.id !== id)
        if (activityLog.value?.id === id) {
          activityLog.value = null
        }
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = { code: 'REPOSITORY_ERROR', message: 'Failed to delete activity log' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    activityLogs: computed(() => activityLogs.value),
    activityLog: computed(() => activityLog.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadActivityLogs,
    loadActivityLog,
    loadByDateRange,
    deleteActivityLog,
  }
}
