import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { Medication, MedicationAdministration } from '@/business/medication/domain/Medication'
import type { MedicationError } from '@/business/medication/domain/MedicationErrors'
import { createUnknownMedicationError } from '@/business/medication/domain/MedicationErrors'
import { createMedicationRepository } from '@/business/medication/infrastructure'
import { toAppError } from '@/shared/domain/AppError'
import { logError } from '@/shared/error/errorLogger'

const repository = createMedicationRepository()

export const useMedicationStore = defineStore('medication', () => {
	const medications = ref<Medication[]>([])
	const currentMedication = ref<Medication | null>(null)
	const administrations = ref<MedicationAdministration[]>([])
	const isLoading = ref(false)
	const error = ref<MedicationError | null>(null)

	// Getters
	const medicationById = computed(() => (id: string) => {
		return medications.value.find(m => m.id === id) || null
	})

	const medicationsByResident = computed(() => (residentId: string) => {
		return medications.value.filter(m => m.residentId === residentId)
	})

	// Actions
	async function fetchMedications(residentId?: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = residentId
				? await repository.findByResident(residentId)
				: await repository.findAll()

			if (result.success) {
				medications.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar medicaciones')
			logError(appError, { operation: 'fetchMedications', residentId })
			error.value = createUnknownMedicationError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchMedication(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.findById(id)

			if (result.success) {
				currentMedication.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar medicación')
			logError(appError, { operation: 'fetchMedication', id })
			error.value = createUnknownMedicationError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchAdministrationHistory(medicationId?: string, residentId?: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = medicationId
				? await repository.getAdministrationHistory(medicationId)
				: residentId
					? await repository.getResidentAdministrationHistory(residentId)
					: {
							success: false as const,
							error: { code: 'INVALID_PARAMS', message: 'medicationId or residentId required' },
						}

			if (result.success) {
				administrations.value = result.value
			} else {
				error.value = result.error
				administrations.value = []
			}
		} catch {
			error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to fetch administration history' }
			administrations.value = []
		} finally {
			isLoading.value = false
		}
	}

	async function createMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.create(medication)

			if (result.success) {
				medications.value.push(result.value)
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al crear medicación')
			logError(appError, { operation: 'createMedication', medication })
			error.value = createUnknownMedicationError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updateMedication(
		id: string,
		updates: Partial<Omit<Medication, 'id' | 'createdAt'>>
	) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.update(id, updates)

			if (result.success) {
				const index = medications.value.findIndex(m => m.id === id)
				if (index !== -1) {
					medications.value[index] = result.value
				}
				if (currentMedication.value?.id === id) {
					currentMedication.value = result.value
				}
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al actualizar medicación')
			logError(appError, { operation: 'updateMedication', id, updates })
			error.value = createUnknownMedicationError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function deleteMedication(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.delete(id)

			if (result.success) {
				medications.value = medications.value.filter(m => m.id !== id)
				if (currentMedication.value?.id === id) {
					currentMedication.value = null
				}
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al eliminar medicación')
			logError(appError, { operation: 'deleteMedication', id })
			error.value = createUnknownMedicationError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function recordAdministration(
		medicationId: string,
		residentId: string,
		notes?: string
	): Promise<MedicationAdministration | null> {
		isLoading.value = true
		error.value = null

		try {
			const authStore = useAuthStore()
			if (!authStore.user) {
				error.value = createUnknownMedicationError('Usuario no autenticado')
				return null
			}

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
			const appError = toAppError(err, 'Error al registrar administración')
			logError(appError, { operation: 'recordAdministration', medicationId, administration })
			error.value = createUnknownMedicationError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	return {
		// State
		medications,
		currentMedication,
		administrations,
		isLoading,
		error,
		// Getters
		medicationById,
		medicationsByResident,
		// Actions
		fetchMedications,
		fetchMedication,
		fetchAdministrationHistory,
		createMedication,
		updateMedication,
		deleteMedication,
		recordAdministration,
	}
})
