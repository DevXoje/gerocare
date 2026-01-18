import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { Medication } from '@/business/medication/domain/Medication'
import type { MedicationCreateInput } from '@/business/medication/domain/Medication.schema'
import { MedicationCreateSchema } from '@/business/medication/domain/Medication.schema'
import { useMedicationStore } from '@/business/medication/store'
import { useNotifications } from '@/shared/composables/useNotifications'

export function useMedicationForm() {
	const medicationStore = useMedicationStore()
	const authStore = useAuthStore()
	const { success, error: showError } = useNotifications()
	const form = ref<Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>>({
		residentId: '',
		name: '',
		dosage: '',
		frequency: '',
		startDate: new Date(),
		endDate: undefined,
		instructions: '',
		prescribedBy: undefined,
	})

	const isLoading = ref(false)
	const error = ref<string | null>(null)

	const isFormValid = computed(() => {
		return !!(
			form.value.residentId &&
			form.value.name?.trim() &&
			form.value.dosage?.trim() &&
			form.value.frequency?.trim() &&
			form.value.startDate
		)
	})

	const resetForm = () => {
		form.value = {
			residentId: '',
			name: '',
			dosage: '',
			frequency: '',
			startDate: new Date(),
			endDate: undefined,
			instructions: '',
			prescribedBy: undefined,
		}
		error.value = null
	}

	const submit = async (): Promise<Medication | null> => {
		if (!isFormValid.value || !authStore.user) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const medicationData: MedicationCreateInput = {
				residentId: form.value.residentId!,
				name: form.value.name!,
				dosage: form.value.dosage!,
				frequency: form.value.frequency!,
				startDate: form.value.startDate!,
				endDate: form.value.endDate,
				instructions: form.value.instructions,
				prescribedBy: form.value.prescribedBy || authStore.user.uid,
			}

			// Validate medication data with Zod
			const validation = MedicationCreateSchema.safeParse(medicationData)
			if (!validation.success) {
				const firstError = validation.error.issues[0]
				const errorMessage =
					firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}

			const result = await medicationStore.createMedication(validation.data)

			if (result) {
				success('Medicación creada exitosamente')
				resetForm()
				return result
			} else {
				const errorMessage =
					medicationStore.error?.message ||
					'Error al crear la medicación. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al crear la medicación. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const update = async (id: string): Promise<Medication | null> => {
		if (!isFormValid.value) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const updates = {
				residentId: form.value.residentId!,
				name: form.value.name!,
				dosage: form.value.dosage!,
				frequency: form.value.frequency!,
				startDate: form.value.startDate!,
				endDate: form.value.endDate,
				instructions: form.value.instructions,
				prescribedBy: form.value.prescribedBy,
			}

			const result = await medicationStore.updateMedication(id, updates)

			if (result) {
				success('Medicación actualizada exitosamente')
				return result
			} else {
				const errorMessage =
					medicationStore.error?.message ||
					'Error al actualizar la medicación. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al actualizar la medicación. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const loadMedicationToForm = async (id: string) => {
		isLoading.value = true
		error.value = null

		try {
			await medicationStore.fetchMedication(id)
			const medication = medicationStore.currentMedication

			if (medication) {
				form.value = {
					residentId: medication.residentId,
					name: medication.name,
					dosage: medication.dosage,
					frequency: medication.frequency,
					startDate: medication.startDate,
					endDate: medication.endDate,
					instructions: medication.instructions,
					prescribedBy: medication.prescribedBy,
				}
			} else {
				error.value = medicationStore.error?.message || 'Medication not found'
			}
		} catch {
			error.value = 'Failed to load medication'
		} finally {
			isLoading.value = false
		}
	}

	return {
		form,
		isLoading: computed(() => isLoading.value),
		error: computed(() => error.value),
		isFormValid,
		resetForm,
		submit,
		update,
		loadMedicationToForm,
	}
}
