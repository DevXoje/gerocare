import { Err,Ok, type Result } from '@/shared/domain/Result'

import { ResidentSchema } from './Resident.schema'
import type { ResidentError } from './ResidentErrors'
import { createResidentValidationError } from './ResidentErrors'

interface MedicalInfo {
  allergies: string[]
  chronicConditions: string[]
  medications: string[]
  dietaryRestrictions: string[]
}

const isMedicalInfoAttribute = (value: string): value is keyof MedicalInfo => {
  const attributes = ['allergies', 'chronicConditions', 'medications', 'dietaryRestrictions']
  return attributes.includes(value)
}
interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface Resident {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  medicalInfo: Partial<MedicalInfo>
  emergencyContacts: EmergencyContact[]
  assignedCaregivers: string[] // User IDs
  createdAt: Date
  updatedAt: Date
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

/**
 * Validate a resident entity using Zod schema
 */
export function validateResident(resident: unknown): Result<Resident, ResidentError> {
  const result = ResidentSchema.safeParse(resident)

  if (!result.success) {
    const firstError = result.error.issues[0]
    return Err(createResidentValidationError(firstError?.message || 'Validation failed'))
  }

  return Ok(result.data)
}

