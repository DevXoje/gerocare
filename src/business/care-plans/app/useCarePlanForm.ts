import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { CarePlan } from '@/business/care-plans/domain/CarePlan'
import type { CarePlanCreateInput } from '@/business/care-plans/domain/CarePlan.schema'
import { CarePlanCreateSchema } from '@/business/care-plans/domain/CarePlan.schema'
import { useCarePlanStore } from '@/business/care-plans/store'
import { useNotifications } from '@/shared/composables/useNotifications'

export function useCarePlanForm() {
	const authStore = useAuthStore()
	const carePlanStore = useCarePlanStore()
	const { success, error: showError } = useNotifications()
	const form = ref<Partial<Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>>>({
		residentId: '',
		title: '',
		description: '',
		category: 'hygiene',
		frequency: 'daily',
		priority: 'medium',
		startDate: new Date(),
		endDate: undefined,
		status: 'active',
		createdBy: undefined,
		assignedTo: undefined,
	})

	const isLoading = ref(false)
	const error = ref<string | null>(null)

	const isFormValid = computed(() => {
		return !!(
			form.value.residentId &&
			form.value.title?.trim() &&
			form.value.description?.trim() &&
			form.value.category &&
			form.value.frequency &&
			form.value.priority &&
			form.value.startDate
		)
	})

	const resetForm = () => {
		form.value = {
			residentId: '',
			title: '',
			description: '',
			category: 'hygiene',
			frequency: 'daily',
			priority: 'medium',
			startDate: new Date(),
			endDate: undefined,
			status: 'active',
			createdBy: undefined,
			assignedTo: undefined,
		}
		error.value = null
	}

	const submit = async (): Promise<CarePlan | null> => {
		if (!isFormValid.value || !authStore.user) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const carePlanData: CarePlanCreateInput = {
				residentId: form.value.residentId!,
				title: form.value.title!,
				description: form.value.description!,
				category: form.value.category!,
				frequency: form.value.frequency!,
				priority: form.value.priority!,
				startDate: form.value.startDate!,
				endDate: form.value.endDate,
				status: (form.value.status || 'active') as CarePlan['status'],
				createdBy: form.value.createdBy || authStore.user.uid,
				assignedTo: form.value.assignedTo,
			}

			// Validate care plan data with Zod
			const validation = CarePlanCreateSchema.safeParse(carePlanData)
			if (!validation.success) {
				const firstError = validation.error.issues[0]
				const errorMessage =
					firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}

			const result = await carePlanStore.createCarePlan(validation.data)

			if (result) {
				success('Plan de Atención Individual (PAI) creado exitosamente')
				resetForm()
				return result
			} else {
				const errorMessage =
					carePlanStore.error?.message || 'Error al crear el PAI. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al crear el PAI. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const update = async (id: string): Promise<CarePlan | null> => {
		if (!isFormValid.value) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const updates = {
				residentId: form.value.residentId!,
				title: form.value.title!,
				description: form.value.description!,
				category: form.value.category!,
				frequency: form.value.frequency!,
				priority: form.value.priority!,
				startDate: form.value.startDate!,
				endDate: form.value.endDate,
				status: form.value.status,
				assignedTo: form.value.assignedTo,
			}

			const result = await carePlanStore.updateCarePlan(id, updates)

			if (result) {
				success('Plan de Atención Individual (PAI) actualizado exitosamente')
				return result
			} else {
				const errorMessage =
					carePlanStore.error?.message ||
					'Error al actualizar el PAI. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al actualizar el PAI. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const loadCarePlanToForm = async (id: string) => {
		isLoading.value = true
		error.value = null

		try {
			await carePlanStore.fetchCarePlan(id)
			const carePlan = carePlanStore.currentCarePlan

			if (carePlan) {
				form.value = {
					residentId: carePlan.residentId,
					title: carePlan.title,
					description: carePlan.description,
					category: carePlan.category,
					frequency: carePlan.frequency,
					priority: carePlan.priority,
					startDate: carePlan.startDate,
					endDate: carePlan.endDate,
					status: carePlan.status,
					createdBy: carePlan.createdBy,
					assignedTo: carePlan.assignedTo,
				}
			} else {
				error.value = carePlanStore.error?.message || 'Care plan not found'
			}
		} catch {
			error.value = 'Failed to load care plan'
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
		loadCarePlanToForm,
	}
}
