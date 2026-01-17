import type { Resident } from '@/business/residents/domain/Resident'

/**
 * Factory function to create a test resident with default values
 */
export function createTestResident(overrides?: Partial<Resident>): Resident {
  const now = new Date()
  const dateOfBirth = new Date(now.getFullYear() - 75, 0, 1) // 75 years old
  
  return {
    id: overrides?.id || 'test-resident-id',
    firstName: overrides?.firstName || 'Juan',
    lastName: overrides?.lastName || 'Pérez',
    dateOfBirth: overrides?.dateOfBirth || dateOfBirth,
    photoURL: overrides?.photoURL,
    medicalInfo: {
      allergies: overrides?.medicalInfo?.allergies || [],
      chronicConditions: overrides?.medicalInfo?.chronicConditions || [],
      medications: overrides?.medicalInfo?.medications || [],
      dietaryRestrictions: overrides?.medicalInfo?.dietaryRestrictions || [],
    },
    emergencyContacts: overrides?.emergencyContacts || [
      {
        name: 'María Pérez',
        relationship: 'Hija',
        phone: '+34600123456',
        email: 'maria.perez@example.com',
      },
    ],
    assignedCaregivers: overrides?.assignedCaregivers || ['caregiver-1'],
    createdAt: overrides?.createdAt || now,
    updatedAt: overrides?.updatedAt || now,
  }
}

/**
 * Factory function to create multiple test residents
 */
export function createTestResidents(count: number, overrides?: Partial<Resident>): Resident[] {
  return Array.from({ length: count }, (_, index) =>
    createTestResident({
      ...overrides,
      id: overrides?.id || `test-resident-${index + 1}`,
      firstName: overrides?.firstName || `Resident${index + 1}`,
      lastName: overrides?.lastName || `Test${index + 1}`,
    })
  )
}

