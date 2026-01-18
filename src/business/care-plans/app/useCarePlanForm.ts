import { computed,ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import { useNotifications } from '@/shared/composables/useNotifications'

import type { CarePlan } from '../domain/CarePlan'
import type { CarePlanCreateInput } from '../domain/CarePlan.schema'
import { CarePlanCreateSchema } from '../domain/CarePlan.schema'
import { createCarePlanRepository } from '../infrastructure'

const repository = createCarePlanRepository()

export function useCarePlanForm() {
  const authStore = useAuthStore()
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
        const errorMessage = firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }

      const result = await repository.create(validation.data)

      if (result.success) {
        success('Plan de Atención Individual (PAI) creado exitosamente')
        resetForm()
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al crear el PAI. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al crear el PAI. Por favor, verifique su conexión e intente nuevamente.'
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

      const result = await repository.update(id, updates)

      if (result.success) {
        success('Plan de Atención Individual (PAI) actualizado exitosamente')
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al actualizar el PAI. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al actualizar el PAI. Por favor, verifique su conexión e intente nuevamente.'
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
      const result = await repository.findById(id)

      if (result.success && result.value) {
        form.value = {
          residentId: result.value.residentId,
          title: result.value.title,
          description: result.value.description,
          category: result.value.category,
          frequency: result.value.frequency,
          priority: result.value.priority,
          startDate: result.value.startDate,
          endDate: result.value.endDate,
          status: result.value.status,
          createdBy: result.value.createdBy,
          assignedTo: result.value.assignedTo,
        }
      } else {
        error.value = result.success ? 'Care plan not found' : result.error.message
      }
    } catch (err) {
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
