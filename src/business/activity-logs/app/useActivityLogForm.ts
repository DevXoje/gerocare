import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import { useNotifications } from '@/shared/composables/useNotifications'

import type { ActivityLog } from '../domain/ActivityLog'
import type { ActivityLogCreateInput } from '../domain/ActivityLog.schema'
import { ActivityLogCreateSchema } from '../domain/ActivityLog.schema'
import { createActivityLogRepository } from '../infrastructure'

const repository = createActivityLogRepository()

export function useActivityLogForm() {
  const authStore = useAuthStore()
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
        const firstError = validation.error.issues[0]
        const errorMessage = firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }

      const result = await repository.create(validation.data)

      if (result.success) {
        success('Actividad registrada exitosamente')
        resetForm()
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al registrar la actividad. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al registrar la actividad. Por favor, verifique su conexión e intente nuevamente.'
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

      const result = await repository.update(id, updates)

      if (result.success) {
        success('Actividad actualizada exitosamente')
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al actualizar la actividad. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al actualizar la actividad. Por favor, verifique su conexión e intente nuevamente.'
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
      const result = await repository.findById(id)

      if (result.success && result.value) {
        form.value = {
          residentId: result.value.residentId,
          caregiverId: result.value.caregiverId,
          activityType: result.value.activityType,
          title: result.value.title,
          description: result.value.description,
          timestamp: result.value.timestamp,
          duration: result.value.duration,
          notes: result.value.notes,
          photos: result.value.photos,
          status: result.value.status,
        }
      } else {
        error.value = result.success ? 'Actividad no encontrada' : result.error.message
      }
    } catch (err) {
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
