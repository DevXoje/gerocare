import { Err, Ok, type Result } from '@/shared/domain/Result'

import { ShiftSchema } from './Shift.schema'
import type { ShiftError } from './ShiftErrors'
import { createShiftValidationError } from './ShiftErrors'

export interface Shift {
  id: string
  caregiverId: string // User ID
  type: 'morning' | 'afternoon' | 'night'
  date: Date
  startTime: string // e.g., "08:00"
  endTime: string // e.g., "16:00"
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  assignedBy?: string // User ID who assigned the shift
  createdAt: Date
  updatedAt: Date
}

/**
 * Validate a shift entity using Zod schema
 */
export function validateShift(shift: unknown): Result<Shift, ShiftError> {
  const result = ShiftSchema.safeParse(shift)

  if (!result.success) {
    const firstError = result.error.issues[0]
    return Err(createShiftValidationError(firstError?.message || 'Validation failed'))
  }

  return Ok(result.data)
}

/**
 * Get type display name
 */
export function getTypeDisplayName(type: Shift['type']): string {
  const names: Record<Shift['type'], string> = {
    morning: 'Mañana',
    afternoon: 'Tarde',
    night: 'Noche',
  }
  return names[type]
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: Shift['status']): string {
  const names: Record<Shift['status'], string> = {
    scheduled: 'Programado',
    'in-progress': 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  }
  return names[status]
}

/**
 * Check if shift is active (scheduled or in-progress)
 */
export function isShiftActive(shift: Shift): boolean {
  return shift.status === 'scheduled' || shift.status === 'in-progress'
}

/**
 * Get shift start DateTime
 */
export function getShiftStartDateTime(shift: Shift): Date {
  const [hours, minutes] = shift.startTime.split(':').map(Number)
  const date = new Date(shift.date)
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Get shift end DateTime
 */
export function getShiftEndDateTime(shift: Shift): Date {
  const [hours, minutes] = shift.endTime.split(':').map(Number)
  const date = new Date(shift.date)
  date.setHours(hours, minutes, 0, 0)
  return date
}
