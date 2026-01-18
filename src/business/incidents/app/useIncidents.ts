import { computed,ref } from 'vue'

import type { Incident } from '../domain/Incident'
import type { IncidentError } from '../domain/IncidentErrors'
import { createIncidentRepository } from '../infrastructure'

const repository = createIncidentRepository()

export function useIncidents() {
  const incidents = ref<Incident[]>([])
  const incident = ref<Incident | null>(null)
  const isLoading = ref(false)
  const error = ref<IncidentError | null>(null)

  const loadIncidents = async (residentId?: string, unresolvedOnly?: boolean) => {
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
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load incidents' }
    } finally {
      isLoading.value = false
    }
  }

  const loadIncident = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findById(id)

      if (result.success) {
        incident.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load incident' }
    } finally {
      isLoading.value = false
    }
  }

  const loadBySeverity = async (severity: Incident['severity']) => {
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
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load incidents by severity' }
    } finally {
      isLoading.value = false
    }
  }

  const resolveIncident = async (id: string, resolvedBy: string, resolutionNotes?: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.update(id, {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy,
        resolutionNotes,
      })

      if (result.success) {
        const index = incidents.value.findIndex((i) => i.id === id)
        if (index !== -1) {
          incidents.value[index] = result.value
        }
        if (incident.value?.id === id) {
          incident.value = result.value
        }
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to resolve incident' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteIncident = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.delete(id)

      if (result.success) {
        incidents.value = incidents.value.filter((i) => i.id !== id)
        if (incident.value?.id === id) {
          incident.value = null
        }
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to delete incident' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    incidents: computed(() => incidents.value),
    incident: computed(() => incident.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadIncidents,
    loadIncident,
    loadBySeverity,
    resolveIncident,
    deleteIncident,
  }
}
