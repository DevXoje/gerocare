import { type Result, Ok, Err } from '@/shared/domain/Result'

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
  photoURL?: string
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
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate a resident entity
 */
export function validateResident(resident: Resident): Result<Resident, string> {
  if (!resident.firstName || typeof resident.firstName !== 'string' || resident.firstName.trim() === '') {
    return Err('firstName is required and must be a non-empty string')
  }

  if (!resident.lastName || typeof resident.lastName !== 'string' || resident.lastName.trim() === '') {
    return Err('lastName is required and must be a non-empty string')
  }

  if (!resident.dateOfBirth || !(resident.dateOfBirth instanceof Date)) {
    return Err('dateOfBirth is required and must be a Date')
  }

  if (!resident.medicalInfo || typeof resident.medicalInfo !== 'object') {
    return Err('medicalInfo is required and must be an object')
  }

  const requiredMedicalFields = ['allergies', 'chronicConditions', 'medications', 'dietaryRestrictions']
  for (const field of requiredMedicalFields) {
    if (!isMedicalInfoAttribute(field) || !Array.isArray(resident.medicalInfo[field])) {
      return Err(`medicalInfo.${field} is required and must be an array`)
    }
  }

  if (!Array.isArray(resident.emergencyContacts)) {
    return Err('emergencyContacts must be an array')
  }

  // Validate email format in emergency contacts if provided
  for (const contact of resident.emergencyContacts) {
    if (contact.email && !isValidEmail(contact.email)) {
      return Err(`Invalid email format in emergencyContacts: ${contact.email}`)
    }
  }

  if (!Array.isArray(resident.assignedCaregivers)) {
    return Err('assignedCaregivers must be an array')
  }

  // Validate that assignedCaregivers contains only strings
  if (!resident.assignedCaregivers.every((id) => typeof id === 'string')) {
    return Err('assignedCaregivers must be an array of strings')
  }

  return Ok(resident)
}

