import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { Shift } from '@/business/shifts/domain/Shift'
import type { ShiftCreateInput } from '@/business/shifts/domain/Shift.schema'
import { ShiftCreateSchema } from '@/business/shifts/domain/Shift.schema'
import { useShiftStore } from '@/business/shifts/store'
import { useNotifications } from '@/shared/composables/useNotifications'

export function useShiftForm() {
	const authStore = useAuthStore()
	const shiftStore = useShiftStore()
	const { success, error: showError } = useNotifications()
	const form = ref<Partial<Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>>>({
		caregiverId: '',
		type: 'morning',
		date: new Date(),
		startTime: '08:00',
		endTime: '16:00',
		status: 'scheduled',
		notes: undefined,
		assignedBy: undefined,
	})

	const isLoading = ref(false)
	const error = ref<string | null>(null)

	const isFormValid = computed(() => {
		return !!(
			form.value.caregiverId &&
			form.value.type &&
			form.value.date &&
			form.value.startTime &&
			form.value.endTime
		)
	})

	const resetForm = () => {
		form.value = {
			caregiverId: '',
			type: 'morning',
			date: new Date(),
			startTime: '08:00',
			endTime: '16:00',
			status: 'scheduled',
			notes: undefined,
			assignedBy: undefined,
		}
		error.value = null
	}

	const submit = async (): Promise<Shift | null> => {
		if (!isFormValid.value) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const shiftData: ShiftCreateInput = {
				caregiverId: form.value.caregiverId!,
				type: form.value.type!,
				date: form.value.date!,
				startTime: form.value.startTime!,
				endTime: form.value.endTime!,
				status: (form.value.status || 'scheduled') as Shift['status'],
				notes: form.value.notes,
				assignedBy: form.value.assignedBy || authStore.user?.uid,
			}

			// Validate shift data with Zod
			const validation = ShiftCreateSchema.safeParse(shiftData)
			if (!validation.success) {
				const firstError = validation.error.issues[0]
				const errorMessage =
					firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}

			const result = await shiftStore.createShift(validation.data)

			if (result) {
				success('Turno creado exitosamente')
				resetForm()
				return result
			} else {
				const errorMessage =
					shiftStore.error?.message || 'Error al crear el turno. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al crear el turno. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const update = async (id: string): Promise<Shift | null> => {
		if (!isFormValid.value) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const updates = {
				caregiverId: form.value.caregiverId!,
				type: form.value.type!,
				date: form.value.date!,
				startTime: form.value.startTime!,
				endTime: form.value.endTime!,
				status: form.value.status,
				notes: form.value.notes,
				assignedBy: form.value.assignedBy,
			}

			const result = await shiftStore.updateShift(id, updates)

			if (result) {
				success('Turno actualizado exitosamente')
				return result
			} else {
				const errorMessage =
					shiftStore.error?.message ||
					'Error al actualizar el turno. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al actualizar el turno. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const loadShiftToForm = async (id: string) => {
		isLoading.value = true
		error.value = null

		try {
			await shiftStore.fetchShift(id)
			const shift = shiftStore.currentShift

			if (shift) {
				form.value = {
					caregiverId: shift.caregiverId,
					type: shift.type,
					date: shift.date,
					startTime: shift.startTime,
					endTime: shift.endTime,
					status: shift.status,
					notes: shift.notes,
					assignedBy: shift.assignedBy,
				}
			} else {
				error.value = shiftStore.error?.message || 'Shift not found'
			}
		} catch {
			error.value = 'Failed to load shift'
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
		loadShiftToForm,
	}
}
