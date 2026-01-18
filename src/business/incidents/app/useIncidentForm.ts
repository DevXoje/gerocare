import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { Incident } from '@/business/incidents/domain/Incident'
import type { IncidentCreateInput } from '@/business/incidents/domain/Incident.schema'
import { IncidentCreateSchema } from '@/business/incidents/domain/Incident.schema'
import { useIncidentStore } from '@/business/incidents/store'
import { useNotifications } from '@/shared/composables/useNotifications'

export function useIncidentForm() {
	const authStore = useAuthStore()
	const incidentStore = useIncidentStore()
	const { success, error: showError } = useNotifications()
	const form = ref<Partial<Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>>>({
		residentId: '',
		type: 'other',
		severity: 'medium',
		description: '',
		location: undefined,
		incidentDate: new Date(),
		reportedBy: undefined,
		status: 'reported',
		resolvedAt: undefined,
		resolvedBy: undefined,
		resolutionNotes: undefined,
		witnessNames: undefined,
	})

	const isLoading = ref(false)
	const error = ref<string | null>(null)

	const isFormValid = computed(() => {
		return !!(
			form.value.residentId &&
			form.value.type &&
			form.value.severity &&
			form.value.description?.trim() &&
			form.value.incidentDate
		)
	})

	const resetForm = () => {
		form.value = {
			residentId: '',
			type: 'other',
			severity: 'medium',
			description: '',
			location: undefined,
			incidentDate: new Date(),
			reportedBy: undefined,
			status: 'reported',
			resolvedAt: undefined,
			resolvedBy: undefined,
			resolutionNotes: undefined,
			witnessNames: undefined,
		}
		error.value = null
	}

	const submit = async (): Promise<Incident | null> => {
		if (!isFormValid.value || !authStore.user) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const incidentData: IncidentCreateInput = {
				residentId: form.value.residentId!,
				type: form.value.type!,
				severity: form.value.severity!,
				description: form.value.description!,
				location: form.value.location,
				incidentDate: form.value.incidentDate!,
				reportedBy: form.value.reportedBy || authStore.user.uid,
				status: (form.value.status || 'reported') as Incident['status'],
				resolvedAt: form.value.resolvedAt,
				resolvedBy: form.value.resolvedBy,
				resolutionNotes: form.value.resolutionNotes,
				witnessNames: form.value.witnessNames,
			}

			// Validate incident data with Zod
			const validation = IncidentCreateSchema.safeParse(incidentData)
			if (!validation.success) {
				const firstError = validation.error.issues[0]
				const errorMessage =
					firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}

			const result = await incidentStore.createIncident(validation.data)

			if (result) {
				success('Incidencia registrada exitosamente')
				resetForm()
				return result
			} else {
				const errorMessage =
					incidentStore.error?.message ||
					'Error al registrar la incidencia. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al registrar la incidencia. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const update = async (id: string): Promise<Incident | null> => {
		if (!isFormValid.value) {
			error.value = 'Please fill in all required fields'
			return null
		}

		isLoading.value = true
		error.value = null

		try {
			const updates = {
				residentId: form.value.residentId!,
				type: form.value.type!,
				severity: form.value.severity!,
				description: form.value.description!,
				location: form.value.location,
				incidentDate: form.value.incidentDate!,
				status: form.value.status,
				resolvedAt: form.value.resolvedAt,
				resolvedBy: form.value.resolvedBy,
				resolutionNotes: form.value.resolutionNotes,
				witnessNames: form.value.witnessNames,
			}

			const result = await incidentStore.updateIncident(id, updates)

			if (result) {
				success('Incidencia actualizada exitosamente')
				return result
			} else {
				const errorMessage =
					incidentStore.error?.message ||
					'Error al actualizar la incidencia. Por favor, intente nuevamente.'
				error.value = errorMessage
				showError(errorMessage)
				return null
			}
		} catch {
			const errorMessage =
				'Error al actualizar la incidencia. Por favor, verifique su conexión e intente nuevamente.'
			error.value = errorMessage
			showError(errorMessage)
			return null
		} finally {
			isLoading.value = false
		}
	}

	const loadIncidentToForm = async (id: string) => {
		isLoading.value = true
		error.value = null

		try {
			await incidentStore.fetchIncident(id)
			const incident = incidentStore.currentIncident

			if (incident) {
				form.value = {
					residentId: incident.residentId,
					type: incident.type,
					severity: incident.severity,
					description: incident.description,
					location: incident.location,
					incidentDate: incident.incidentDate,
					reportedBy: incident.reportedBy,
					status: incident.status,
					resolvedAt: incident.resolvedAt,
					resolvedBy: incident.resolvedBy,
					resolutionNotes: incident.resolutionNotes,
					witnessNames: incident.witnessNames,
				}
			} else {
				error.value = incidentStore.error?.message || 'Incident not found'
			}
		} catch {
			error.value = 'Failed to load incident'
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
		loadIncidentToForm,
	}
}
