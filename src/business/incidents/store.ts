import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Incident } from '@/business/incidents/domain/Incident'
import type { IncidentError } from '@/business/incidents/domain/IncidentErrors'
import { createUnknownIncidentError } from '@/business/incidents/domain/IncidentErrors'
import { createIncidentRepository } from '@/business/incidents/infrastructure'
import { toAppError } from '@/shared/domain/AppError'
import { logError } from '@/shared/error/errorLogger'

const repository = createIncidentRepository()

export const useIncidentStore = defineStore('incidents', () => {
	const incidents = ref<Incident[]>([])
	const currentIncident = ref<Incident | null>(null)
	const isLoading = ref(false)
	const error = ref<IncidentError | null>(null)

	// Getters
	const incidentById = computed(() => (id: string) => {
		return incidents.value.find(i => i.id === id) || null
	})

	const incidentsByResident = computed(() => (residentId: string) => {
		return incidents.value.filter(i => i.residentId === residentId)
	})

	const unresolvedIncidentsByResident = computed(() => (residentId: string) => {
		return incidents.value.filter(
			i => i.residentId === residentId && (i.status === 'reported' || i.status === 'in-progress')
		)
	})

	// Actions
	async function fetchIncidents(residentId?: string, unresolvedOnly?: boolean) {
		isLoading.value = true
		error.value = null

		try {
			const result = residentId
				? unresolvedOnly
					? await repository.findUnresolvedByResident(residentId)
					: await repository.findByResident(residentId)
				: await repository.findAll()

			if (result.success) {
				incidents.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar incidentes')
			logError(appError, { operation: 'fetchIncidents', residentId })
			error.value = createUnknownIncidentError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function fetchIncident(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.findById(id)

			if (result.success) {
				currentIncident.value = result.value
			} else {
				error.value = result.error
			}
		} catch {
			error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to fetch incident' }
		} finally {
			isLoading.value = false
		}
	}

	async function fetchBySeverity(severity: Incident['severity']) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.findBySeverity(severity)

			if (result.success) {
				incidents.value = result.value
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al cargar incidentes por severidad')
			logError(appError, { operation: 'fetchIncidentsBySeverity', severity })
			error.value = createUnknownIncidentError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	async function createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.create(incident)

			if (result.success) {
				incidents.value.push(result.value)
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch {
			error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to create incident' }
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updateIncident(id: string, updates: Partial<Omit<Incident, 'id' | 'createdAt'>>) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.update(id, updates)

			if (result.success) {
				const index = incidents.value.findIndex(i => i.id === id)
				if (index !== -1) {
					incidents.value[index] = result.value
				}
				if (currentIncident.value?.id === id) {
					currentIncident.value = result.value
				}
				return result.value
			} else {
				error.value = result.error
				return null
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al actualizar incidente')
			logError(appError, { operation: 'updateIncident', id, updates })
			error.value = createUnknownIncidentError(appError.message)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function resolveIncident(id: string, resolvedBy: string, resolutionNotes?: string) {
		return updateIncident(id, {
			status: 'resolved',
			resolvedAt: new Date(),
			resolvedBy,
			resolutionNotes,
		})
	}

	async function deleteIncident(id: string) {
		isLoading.value = true
		error.value = null

		try {
			const result = await repository.delete(id)

			if (result.success) {
				incidents.value = incidents.value.filter(i => i.id !== id)
				if (currentIncident.value?.id === id) {
					currentIncident.value = null
				}
			} else {
				error.value = result.error
			}
		} catch (err) {
			const appError = toAppError(err, 'Error al eliminar incidente')
			logError(appError, { operation: 'deleteIncident', id })
			error.value = createUnknownIncidentError(appError.message)
		} finally {
			isLoading.value = false
		}
	}

	return {
		// State
		incidents,
		currentIncident,
		isLoading,
		error,
		// Getters
		incidentById,
		incidentsByResident,
		unresolvedIncidentsByResident,
		// Actions
		fetchIncidents,
		fetchIncident,
		fetchBySeverity,
		createIncident,
		updateIncident,
		resolveIncident,
		deleteIncident,
	}
})
