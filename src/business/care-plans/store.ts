import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { CarePlan, CarePlanActivity } from '@/business/care-plans/domain/CarePlan'
import type { CarePlanError } from '@/business/care-plans/domain/CarePlanErrors'
import { createUnknownCarePlanError } from '@/business/care-plans/domain/CarePlanErrors'
import { createCarePlanRepository } from '@/business/care-plans/infrastructure'
import { toAppError } from '@/shared/domain/AppError'
import { logError } from '@/shared/error/errorLogger'

const repository = createCarePlanRepository()

export const useCarePlanStore = defineStore('carePlans', () => {
	const carePlans = ref<CarePlan[]>([])
	const currentCarePlan = ref<CarePlan | null>(null)
	const activities = ref<CarePlanActivity[]>([])
	const isLoading = ref(false)
	const error = ref<CarePlanError | null>(null)

	// Getters
	const carePlanById = computed(() => (id: string) => {
		return carePlans.value.find(cp => cp.id === id) || null
	})

	const carePlansByResident = computed(() => (residentId: string) => {
		return carePlans.value.filter(cp => cp.residentId === residentId)
	})

	const activeCarePlansByResident = computed(() => (residentId: string) => {
		return carePlans.value.filter(cp => cp.residentId === residentId && cp.status === 'active')
	})

	// Actions
	async function fetchCarePlans(residentId?: string, activeOnly?: boolean) {
		isLoading.value = true
		error.value = null

		try {
			let result
			if (residentId === undefined) {
				result = await repository.findAll()
			} else if (activeOnly) {
				result = await repository.findActiveByResident(residentId)
			} else {
				result = await repository.findByResident(residentId)
			}

			if (result.success) {
				carePlans.value = result.value
			} else {
				error.value = result.error
			}
		} catch {
			error.value = createUnknownCarePlanError('Failed to fetch care plans')
		} finally {
			isLoading.value = false
		}
	}

	async function fetchCarePlan(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.findById(id)

			if (result.success) {
				currentCarePlan.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar plan de cuidado')
			logError(appError, { operation: 'fetchCarePlan', id })
			error.value = createUnknownCarePlanError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchActivityHistory(carePlanId?: string, residentId?: string) {
		isLoading.value = true
		error.value = null

		try {
			let result
			if (carePlanId) {
				result = await repository.getActivityHistory(carePlanId)
			} else if (residentId) {
				result = await repository.getResidentActivityHistory(residentId)
			} else {
				result = {
					success: false as const,
					error: createUnknownCarePlanError('carePlanId or residentId required'),
				}
			}

			if (result.success) {
				activities.value = result.value
			} else {
				error.value = result.error
				activities.value = []
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar historial de actividades')
			logError(appError, { operation: 'fetchActivityHistory', carePlanId })
			error.value = createUnknownCarePlanError(appError.message)
			activities.value = []
		} finally {
			isLoading.value = false
		}
	}

	async function createCarePlan(carePlan: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.create(carePlan)

			if (result.success) {
				carePlans.value.push(result.value)
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al crear plan de cuidado')
			logError(appError, { operation: 'createCarePlan', carePlan })
			error.value = createUnknownCarePlanError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updateCarePlan(id: string, updates: Partial<Omit<CarePlan, 'id' | 'createdAt'>>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.update(id, updates)

			if (result.success) {
				const index = carePlans.value.findIndex(cp => cp.id === id)
				if (index !== -1) {
					carePlans.value[index] = result.value
				}
				if (currentCarePlan.value?.id === id) {
					currentCarePlan.value = result.value
				}
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al actualizar plan de cuidado')
			logError(appError, { operation: 'updateCarePlan', id, updates })
			error.value = createUnknownCarePlanError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function deleteCarePlan(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.delete(id)

			if (result.success) {
				carePlans.value = carePlans.value.filter(cp => cp.id !== id)
				if (currentCarePlan.value?.id === id) {
					currentCarePlan.value = null
				}
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al eliminar plan de cuidado')
			logError(appError, { operation: 'deleteCarePlan', id })
			error.value = createUnknownCarePlanError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function recordActivity(
		carePlanId: string,
		residentId: string,
		activityDate: Date,
		notes?: string,
		status: 'completed' | 'skipped' = 'completed'
	): Promise<CarePlanActivity | null> {
		isLoading.value = true
		error.value = null

		const authStore = useAuthStore()
		const activity: Omit<CarePlanActivity, 'id'> = {
			carePlanId,
			residentId,
			activityDate,
			completedBy: status === 'completed' ? authStore.user?.uid : undefined,
			completedAt: status === 'completed' ? new Date() : undefined,
			notes,
			status: status === 'completed' ? ('completed' as const) : ('skipped' as const),
		}

		try {
			const result = await repository.recordActivity(activity)

			if (result.success) {
				activities.value.unshift(result.value)
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al registrar actividad')
			logError(appError, { operation: 'recordActivity', carePlanId, activity })
			error.value = createUnknownCarePlanError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	return {
		// State
		carePlans,
		currentCarePlan,
		activities,
		isLoading,
		error,
		// Getters
		carePlanById,
		carePlansByResident,
		activeCarePlansByResident,
		// Actions
		fetchCarePlans,
		fetchCarePlan,
		fetchActivityHistory,
		createCarePlan,
		updateCarePlan,
		deleteCarePlan,
		recordActivity,
	}
})
