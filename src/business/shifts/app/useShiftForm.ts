import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'

import type { Shift } from '../domain/Shift'
import { ShiftCreateSchema } from '../domain/Shift.schema'
import type { ShiftCreateInput } from '../domain/Shift.schema'
import { createShiftRepository } from '../infrastructure'

const repository = createShiftRepository()

export function useShiftForm() {
  const authStore = useAuthStore()
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
        error.value = firstError?.message || 'Validation failed'
        return null
      }

      const result = await repository.create(validation.data)

      if (result.success) {
        resetForm()
        return result.value
      } else {
        error.value = result.error.message
        return null
      }
    } catch (err) {
      error.value = 'Failed to create shift'
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

      const result = await repository.update(id, updates)

      if (result.success) {
        return result.value
      } else {
        error.value = result.error.message
        return null
      }
    } catch (err) {
      error.value = 'Failed to update shift'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const loadShiftToForm = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findById(id)

      if (result.success && result.value) {
        form.value = {
          caregiverId: result.value.caregiverId,
          type: result.value.type,
          date: result.value.date,
          startTime: result.value.startTime,
          endTime: result.value.endTime,
          status: result.value.status,
          notes: result.value.notes,
          assignedBy: result.value.assignedBy,
        }
      } else {
        error.value = result.success ? 'Shift not found' : result.error.message
      }
    } catch (err) {
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
