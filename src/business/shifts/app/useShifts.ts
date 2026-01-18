import { computed, ref } from 'vue'

import type { Shift } from '../domain/Shift'
import type { ShiftError } from '../domain/ShiftErrors'
import { createShiftRepository } from '../infrastructure'

const repository = createShiftRepository()

export function useShifts() {
  const shifts = ref<Shift[]>([])
  const shift = ref<Shift | null>(null)
  const isLoading = ref(false)
  const error = ref<ShiftError | null>(null)

  const loadShifts = async (caregiverId?: string, startDate?: Date, endDate?: Date) => {
    isLoading.value = true
    error.value = null

    try {
      const result = caregiverId
        ? await repository.findByCaregiver(caregiverId)
        : startDate && endDate
          ? await repository.findByDateRange(startDate, endDate)
          : startDate
            ? await repository.findByDate(startDate)
            : await repository.findAll()

      if (result.success) {
        shifts.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load shifts' }
    } finally {
      isLoading.value = false
    }
  }

  const loadShift = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findById(id)

      if (result.success) {
        shift.value = result.value
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load shift' }
    } finally {
      isLoading.value = false
    }
  }

  const updateShiftStatus = async (id: string, status: Shift['status']): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.update(id, { status })

      if (result.success) {
        const index = shifts.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          shifts.value[index] = result.value
        }
        if (shift.value?.id === id) {
          shift.value = result.value
        }
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to update shift status' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteShift = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.delete(id)

      if (result.success) {
        shifts.value = shifts.value.filter((s) => s.id !== id)
        if (shift.value?.id === id) {
          shift.value = null
        }
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to delete shift' }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    shifts: computed(() => shifts.value),
    shift: computed(() => shift.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadShifts,
    loadShift,
    updateShiftStatus,
    deleteShift,
  }
}
