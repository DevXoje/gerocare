import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { ActivityLog } from '@/business/activity-logs/domain/ActivityLog'
import type { ActivityLogError } from '@/business/activity-logs/domain/ActivityLogErrors'
import { createActivityLogRepositoryError } from '@/business/activity-logs/domain/ActivityLogErrors'
import { createActivityLogRepository } from '@/business/activity-logs/infrastructure'
import { toAppError } from '@/shared/domain/AppError'
import { logError } from '@/shared/error/errorLogger'

const repository = createActivityLogRepository()

export const useActivityLogStore = defineStore('activityLogs', () => {
	const activityLogs = ref<ActivityLog[]>([])
	const currentActivityLog = ref<ActivityLog | null>(null)
	const isLoading = ref(false)
	const error = ref<ActivityLogError | null>(null)

	// Getters
	const activityLogById = computed(() => (id: string) => {
		return activityLogs.value.find(log => log.id === id) || null
	})

	const activityLogsByResident = computed(() => (residentId: string) => {
		return activityLogs.value.filter(log => log.residentId === residentId)
	})

	const activityLogsByCaregiver = computed(() => (caregiverId: string) => {
		return activityLogs.value.filter(log => log.caregiverId === caregiverId)
	})

	// Actions
	async function fetchActivityLogs(residentId?: string, caregiverId?: string) {
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
			const appError = toAppError(err, 'Error al cargar registros de actividad')
			logError(appError, { operation: 'fetchActivityLogs', residentId, caregiverId })
			error.value = createActivityLogRepositoryError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchActivityLog(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.findById(id)

			if (result.success) {
				currentActivityLog.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar registro de actividad')
			logError(appError, { operation: 'fetchActivityLog', id })
			error.value = createActivityLogRepositoryError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchByDateRange(residentId: string, startDate: Date, endDate: Date) {
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
			const appError = toAppError(err, 'Error al cargar registros de actividad por rango de fechas')
			logError(appError, { operation: 'fetchByDateRange', residentId, startDate, endDate })
			error.value = createActivityLogRepositoryError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function createActivityLog(activityLog: Omit<ActivityLog, 'id' | 'createdAt'>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.create(activityLog)

			if (result.success) {
				activityLogs.value.push(result.value)
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al crear registro de actividad')
			logError(appError, { operation: 'createActivityLog', activityLog })
			error.value = createActivityLogRepositoryError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updateActivityLog(
		id: string,
		updates: Partial<Omit<ActivityLog, 'id' | 'createdAt'>>
	) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.update(id, updates)

			if (result.success) {
				const index = activityLogs.value.findIndex(log => log.id === id)
				if (index !== -1) {
					activityLogs.value[index] = result.value
				}
				if (currentActivityLog.value?.id === id) {
					currentActivityLog.value = result.value
				}
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al actualizar registro de actividad')
			logError(appError, { operation: 'updateActivityLog', id, updates })
			error.value = createActivityLogRepositoryError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function deleteActivityLog(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.delete(id)

			if (result.success) {
				activityLogs.value = activityLogs.value.filter(log => log.id !== id)
				if (currentActivityLog.value?.id === id) {
					currentActivityLog.value = null
				}
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al eliminar registro de actividad')
			logError(appError, { operation: 'deleteActivityLog', id })
			error.value = createActivityLogRepositoryError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	return {
		// State
		activityLogs,
		currentActivityLog,
		isLoading,
		error,
		// Getters
		activityLogById,
		activityLogsByResident,
		activityLogsByCaregiver,
		// Actions
		fetchActivityLogs,
		fetchActivityLog,
		fetchByDateRange,
		createActivityLog,
		updateActivityLog,
		deleteActivityLog,
	}
})
