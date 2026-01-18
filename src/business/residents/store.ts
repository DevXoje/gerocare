import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { Resident } from '@/business/residents/domain/Resident'
import type { ResidentError } from '@/business/residents/domain/ResidentErrors'
import { createUnknownResidentError } from '@/business/residents/domain/ResidentErrors'
import { createResidentRepository } from '@/business/residents/infrastructure'
import { toAppError } from '@/shared/domain/AppError'
import { logError } from '@/shared/error/errorLogger'

const repository = createResidentRepository()

export const useResidentStore = defineStore('residents', () => {
	const residents = ref<Resident[]>([])
	const currentResident = ref<Resident | null>(null)
	const isLoading = ref(false)
	const error = ref<ResidentError | null>(null)

	// Getters
	const residentById = computed(() => (id: string) => {
		return residents.value.find(r => r.id === id) || null
	})

	const residentsByCaregiver = computed(() => (caregiverId: string) => {
		return residents.value.filter(r => r.assignedCaregivers.includes(caregiverId))
	})

	// Actions
	async function fetchResidents(caregiverId?: string) {
		isLoading.value = true
		error.value = null

		try {
			const authStore = useAuthStore()
			const targetCaregiverId = caregiverId || authStore.user?.uid

			if (!targetCaregiverId) {
				error.value = createUnknownResidentError('Usuario no autenticado')
				return
			}

			const result = await repository.findByCaregiver(targetCaregiverId)

			if (result.success) {
				residents.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar residentes')
			logError(appError, { operation: 'fetchResidents', caregiverId })
			error.value = createUnknownResidentError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchResident(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.findById(id)

			if (result.success) {
				currentResident.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar residente')
			logError(appError, { operation: 'fetchResident', id })
			error.value = createUnknownResidentError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function createResident(resident: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.create(resident)

			if (result.success) {
				residents.value.push(result.value)
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al crear residente')
			logError(appError, { operation: 'createResident', resident })
			error.value = createUnknownResidentError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updateResident(id: string, updates: Partial<Omit<Resident, 'id' | 'createdAt'>>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.update(id, updates)

			if (result.success) {
				const index = residents.value.findIndex(r => r.id === id)
				if (index !== -1) {
					residents.value[index] = result.value
				}
				if (currentResident.value?.id === id) {
					currentResident.value = result.value
				}
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch {
			error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to update resident' }
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function deleteResident(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.delete(id)

			if (result.success) {
				residents.value = residents.value.filter(r => r.id !== id)
				if (currentResident.value?.id === id) {
					currentResident.value = null
				}
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al eliminar residente')
			logError(appError, { operation: 'deleteResident', id })
			error.value = createUnknownResidentError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	return {
		// State
		residents,
		currentResident,
		isLoading,
		error,
		// Getters
		residentById,
		residentsByCaregiver,
		// Actions
		fetchResidents,
		fetchResident,
		createResident,
		updateResident,
		deleteResident,
	}
})
