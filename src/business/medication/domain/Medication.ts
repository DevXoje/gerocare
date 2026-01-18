import { Err,Ok, type Result } from '@/shared/domain/Result'

import { MedicationSchema } from './Medication.schema'
import type { MedicationError } from './MedicationErrors'
import { createMedicationValidationError } from './MedicationErrors'

export interface Medication {
  id: string
  residentId: string
  name: string
  dosage: string
  frequency: string // e.g., "8:00, 14:00, 20:00" or "daily", "twice daily"
  startDate: Date
  endDate?: Date
  instructions?: string
  prescribedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface MedicationAdministration {
  id: string
  medicationId: string
  residentId: string
  administeredAt: Date
  administeredBy: string // User ID
  notes?: string
  status: 'administered' | 'missed' | 'skipped'
}

/**
 * Validate a medication entity using Zod schema
 */
export function validateMedication(medication: unknown): Result<Medication, MedicationError> {
  const result = MedicationSchema.safeParse(medication)

  if (!result.success) {
    const firstError = result.error.issues[0]
    return Err(createMedicationValidationError(firstError?.message || 'Validation failed'))
  }

  return Ok(result.data)
}

/**
 * Check if medication is currently active
 */
export function isMedicationActive(medication: Medication, date: Date = new Date()): boolean {
  if (date < medication.startDate) {
    return false
  }

  if (medication.endDate && date > medication.endDate) {
    return false
  }

  return true
}

/**
 * Parse frequency string to times array
 */
export function parseFrequency(frequency: string): string[] {
  if (frequency.includes(',')) {
    return frequency.split(',').map((time) => time.trim())
  }
  // Handle common frequencies
  if (frequency.toLowerCase() === 'daily') {
    return ['08:00']
  }
  if (frequency.toLowerCase().includes('twice')) {
    return ['08:00', '20:00']
  }
  if (frequency.toLowerCase().includes('three')) {
    return ['08:00', '14:00', '20:00']
  }
  return [frequency.trim()]
}
