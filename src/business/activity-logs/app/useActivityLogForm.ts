import { computed, ref } from 'vue'

import type { ActivityLog } from '@/business/activity-logs/domain/ActivityLog'
import type { ActivityLogCreateInput } from '@/business/activity-logs/domain/ActivityLog.schema'
import { ActivityLogCreateSchema } from '@/business/activity-logs/domain/ActivityLog.schema'
import { useActivityLogStore } from '@/business/activity-logs/store'
import { useAuthStore } from '@/business/auth/store'
import { useNotifications } from '@/shared/composables/useNotifications'
import { getZodErrorMessage } from '@/shared/validation/zodErrorMapper'

export function useActivityLogForm() {
	const authStore = useAuthStore()
	const activityLogStore = useActivityLogStore()
	const { success, error: showError } = useNotifications()
	const form = ref<Partial<Omit<ActivityLog, 'id' | 'createdAt'>>>({
		residentId: '',
		caregiverId: undefined,
		activityType: 'other',
		title: '',
		description: '',
		timestamp: new Date(),
		duration: undefined,
		notes: undefined,
		photos: undefined,
		status: 'completed',
	})

	const isLoading = ref(false)
	const error = ref<string | null>(null)

	const isFormValid = computed(() => {
		return !!(
			form.value.residentId &&
			form.value.activityType &&
			form.value.title?.trim() &&
			form.value.description?.trim() &&
			form.value.timestamp
		)
	})

	const resetForm = () => {
		form.value = {
			residentId: '',
			caregiverId: undefined,
			activityType: 'other',
			title: '',
			description: '',
			timestamp: new Date(),
			duration: undefined,
			notes: undefined,
			photos: undefined,
			status: 'completed',
		}
		error.value = null
	}

	const submit = async (): Promise<ActivityLog | null> => {
		if (!isFormValid.value || !authStore.user) {
			error.value = 'Por favor, complete todos los campos requeridos'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const activityLogData: ActivityLogCreateInput = {
				residentId: form.value.residentId!,
				caregiverId: form.value.caregiverId || authStore.user.uid,
				activityType: form.value.activityType!,
				title: form.value.title!,
				description: form.value.description!,
				timestamp: form.value.timestamp!,
				duration: form.value.duration,
				notes: form.value.notes,
				photos: form.value.photos,
				status: (form.value.status || 'completed') as ActivityLog['status'],
			}

			// Validate activity log data with Zod
			const validation = ActivityLogCreateSchema.safeParse(activityLogData)
			if (!validation.success) {
				const errorMessage = getZodErrorMessage(validation.error)
				error.value = errorMessage
				showError(errorMessage)
				return null
			}

			const result = await activityLogStore.createActivityLog(validation.data)

			if (result) {
				success('Actividad registrada exitosamente')
				resetForm()
				return result
			} else {
				const errorMessage =
					activityLogStore.error?.message ||
					'Error al registrar la actividad. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al registrar la actividad. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const update = async (id: string): Promise<ActivityLog | null> => {
		if (!isFormValid.value) {
			error.value = 'Por favor, complete todos los campos requeridos'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const updates = {
				residentId: form.value.residentId!,
				caregiverId: form.value.caregiverId,
				activityType: form.value.activityType!,
				title: form.value.title!,
				description: form.value.description!,
				timestamp: form.value.timestamp!,
				duration: form.value.duration,
				notes: form.value.notes,
				photos: form.value.photos,
				status: form.value.status,
			}

			const result = await activityLogStore.updateActivityLog(id, updates)

			if (result) {
				success('Actividad actualizada exitosamente')
				return result
			} else {
				const errorMessage =
					activityLogStore.error?.message ||
					'Error al actualizar la actividad. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al actualizar la actividad. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const loadActivityLogToForm = async (id: string) => {
		isLoading.value = true
		error.value = null

		try {
			await activityLogStore.fetchActivityLog(id)
			const activityLog = activityLogStore.currentActivityLog

			if (activityLog) {
				form.value = {
					residentId: activityLog.residentId,
					caregiverId: activityLog.caregiverId,
					activityType: activityLog.activityType,
					title: activityLog.title,
					description: activityLog.description,
					timestamp: activityLog.timestamp,
					duration: activityLog.duration,
					notes: activityLog.notes,
					photos: activityLog.photos,
					status: activityLog.status,
				}
			} else {
				error.value = activityLogStore.error?.message || 'Actividad no encontrada'
			}
		} catch {
			error.value = 'Error al cargar la actividad'
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
		loadActivityLogToForm,
	}
}
