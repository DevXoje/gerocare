import { computed,ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import { useNotifications } from '@/shared/composables/useNotifications'

import type { Medication } from '../domain/Medication'
import type { MedicationCreateInput } from '../domain/Medication.schema'
import { MedicationCreateSchema } from '../domain/Medication.schema'
import { createMedicationRepository } from '../infrastructure'

const repository = createMedicationRepository()

export function useMedicationForm() {
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
        const errorMessage = firstError?.message || 'Error de validación. Por favor, verifique los campos requeridos.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }

      const result = await repository.create(validation.data)

      if (result.success) {
        success('Medicación creada exitosamente')
        resetForm()
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al crear la medicación. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al crear la medicación. Por favor, verifique su conexión e intente nuevamente.'
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

      const result = await repository.update(id, updates)

      if (result.success) {
        success('Medicación actualizada exitosamente')
        return result.value
      } else {
        const errorMessage = result.error.message || 'Error al actualizar la medicación. Por favor, intente nuevamente.'
        error.value = errorMessage
        showError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Error al actualizar la medicación. Por favor, verifique su conexión e intente nuevamente.'
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
      const result = await repository.findById(id)

      if (result.success && result.value) {
        form.value = {
          residentId: result.value.residentId,
          name: result.value.name,
          dosage: result.value.dosage,
          frequency: result.value.frequency,
          startDate: result.value.startDate,
          endDate: result.value.endDate,
          instructions: result.value.instructions,
          prescribedBy: result.value.prescribedBy,
        }
      } else {
        error.value = result.success ? 'Medication not found' : result.error.message
      }
    } catch (err) {
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
