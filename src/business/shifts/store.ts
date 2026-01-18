import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Shift } from '@/business/shifts/domain/Shift'
import type { ShiftError } from '@/business/shifts/domain/ShiftErrors'
import { createUnknownShiftError } from '@/business/shifts/domain/ShiftErrors'
import { createShiftRepository } from '@/business/shifts/infrastructure'
import { toAppError } from '@/shared/domain/AppError'
import { logError } from '@/shared/error/errorLogger'

const repository = createShiftRepository()

export const useShiftStore = defineStore('shifts', () => {
	const shifts = ref<Shift[]>([])
	const currentShift = ref<Shift | null>(null)
	const isLoading = ref(false)
	const error = ref<ShiftError | null>(null)

	// Getters
	const shiftById = computed(() => (id: string) => {
		return shifts.value.find(s => s.id === id) || null
	})

	const shiftsByCaregiver = computed(() => (caregiverId: string) => {
		return shifts.value.filter(s => s.caregiverId === caregiverId)
	})

	// Actions
	async function fetchShifts(caregiverId?: string, startDate?: Date, endDate?: Date) {
		isLoading.value = true
		error.value = null

		try {
			const result = caregiverId
				? await repository.findByCaregiver(caregiverId)
				: startDate && endDate
					? await repository.findByDateRange(startDate, endDate)
					: startDate
						? await repository.findByDate(startDate)
						: await repository.findAll()

			if (result.success) {
				shifts.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar turnos')
			logError(appError, { operation: 'fetchShifts', caregiverId, startDate, endDate })
			error.value = createUnknownShiftError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchShift(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.findById(id)

			if (result.success) {
				currentShift.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar turno')
			logError(appError, { operation: 'fetchShift', id })
			error.value = createUnknownShiftError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function createShift(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.create(shift)

			if (result.success) {
				shifts.value.push(result.value)
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch {
			error.value = { code: 'UNKNOWN_SHIFT_ERROR', message: 'Failed to create shift' }
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updateShift(id: string, updates: Partial<Omit<Shift, 'id' | 'createdAt'>>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.update(id, updates)

			if (result.success) {
				const index = shifts.value.findIndex(s => s.id === id)
				if (index !== -1) {
					shifts.value[index] = result.value
				}
				if (currentShift.value?.id === id) {
					currentShift.value = result.value
				}
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al actualizar turno')
			logError(appError, { operation: 'updateShift', id, updates })
			error.value = createUnknownShiftError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updateShiftStatus(id: string, status: Shift['status']) {
		return updateShift(id, { status })
	}

	async function deleteShift(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.delete(id)

			if (result.success) {
				shifts.value = shifts.value.filter(s => s.id !== id)
				if (currentShift.value?.id === id) {
					currentShift.value = null
				}
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al eliminar turno')
			logError(appError, { operation: 'deleteShift', id })
			error.value = createUnknownShiftError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	return {
		// State
		shifts,
		currentShift,
		isLoading,
		error,
		// Getters
		shiftById,
		shiftsByCaregiver,
		// Actions
		fetchShifts,
		fetchShift,
		createShift,
		updateShift,
		updateShiftStatus,
		deleteShift,
	}
})
