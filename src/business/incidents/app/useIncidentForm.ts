import { computed,ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import { useNotifications } from '@/shared/composables/useNotifications'

import type { Incident } from '../domain/Incident'
import type { IncidentCreateInput } from '../domain/Incident.schema'
import { IncidentCreateSchema } from '../domain/Incident.schema'
import { createIncidentRepository } from '../infrastructure'

const repository = createIncidentRepository()

export function useIncidentForm() {
  const authStore = useAuthStore()
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
        const errorMessage = firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }

      const result = await repository.create(validation.data)

      if (result.success) {
        success('Incidencia registrada exitosamente')
        resetForm()
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al registrar la incidencia. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al registrar la incidencia. Por favor, verifique su conexión e intente nuevamente.'
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

      const result = await repository.update(id, updates)

      if (result.success) {
        success('Incidencia actualizada exitosamente')
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al actualizar la incidencia. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al actualizar la incidencia. Por favor, verifique su conexión e intente nuevamente.'
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
      const result = await repository.findById(id)

      if (result.success && result.value) {
        form.value = {
          residentId: result.value.residentId,
          type: result.value.type,
          severity: result.value.severity,
          description: result.value.description,
          location: result.value.location,
          incidentDate: result.value.incidentDate,
          reportedBy: result.value.reportedBy,
          status: result.value.status,
          resolvedAt: result.value.resolvedAt,
          resolvedBy: result.value.resolvedBy,
          resolutionNotes: result.value.resolutionNotes,
          witnessNames: result.value.witnessNames,
        }
      } else {
        error.value = result.success ? 'Incident not found' : result.error.message
      }
    } catch (err) {
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
