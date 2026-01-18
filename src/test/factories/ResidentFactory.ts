import { faker } from '@faker-js/faker'

import type { Resident } from '@/business/residents/domain/Resident'

/**
 * Type for the builder object returned by createResidentFactory
 */
export type ResidentFactoryBuilder = {
  withId: (id: string) => ResidentFactoryBuilder
  withName: (firstName: string, lastName: string) => ResidentFactoryBuilder
  withAge: (age: number) => ResidentFactoryBuilder
  withDateOfBirth: (dateOfBirth: Date) => ResidentFactoryBuilder
  withPhotoURL: (photoURL: string) => ResidentFactoryBuilder
  withMedicalInfo: (info: Partial<Resident['medicalInfo']>) => ResidentFactoryBuilder
  withAllergies: (...allergies: string[]) => ResidentFactoryBuilder
  withChronicConditions: (...conditions: string[]) => ResidentFactoryBuilder
  withEmergencyContacts: (contacts: Resident['emergencyContacts']) => ResidentFactoryBuilder
  withEmergencyContact: (contact: Resident['emergencyContacts'][0]) => ResidentFactoryBuilder
  withAssignedCaregivers: (...caregiverIds: string[]) => ResidentFactoryBuilder
  withTimestamps: (createdAt: Date, updatedAt: Date) => ResidentFactoryBuilder
  build: (overrides?: Partial<Resident>) => Resident
}

/**
 * Create a factory builder for creating test Resident entities with realistic data.
 * Uses builder pattern for flexible test data generation.
 *
 * @example
 * ```ts
 * // Create with defaults
 * const resident = createResidentFactory().build()
 *
 * // Create with specific age
 * const resident = createResidentFactory().withAge(75).build()
 *
 * // Create with medical info
 * const resident = createResidentFactory()
 *   .withMedicalInfo({ allergies: ['Peanuts'] })
 *   .build()
 * ```
 */
export function createResidentFactory(
  overrides?: Partial<Resident>
): ResidentFactoryBuilder {
  const resident: Partial<Resident> = { ...overrides }

  const builder: ResidentFactoryBuilder = {
    withId(id: string) {
      resident.id = id
      return builder
    },

    withName(firstName: string, lastName: string) {
      resident.firstName = firstName
      resident.lastName = lastName
      return builder
    },

    withAge(age: number) {
      const today = new Date()
      resident.dateOfBirth = new Date(
        today.getFullYear() - age,
        faker.number.int({ min: 0, max: 11 }),
        faker.number.int({ min: 1, max: 28 })
      )
      return builder
    },

    withDateOfBirth(dateOfBirth: Date) {
      resident.dateOfBirth = dateOfBirth
      return builder
    },

    withPhotoURL(photoURL: string) {
      resident.photoURL = photoURL
      return builder
    },

    withMedicalInfo(info: Partial<Resident['medicalInfo']>) {
      resident.medicalInfo = {
        allergies: [],
        chronicConditions: [],
        medications: [],
        dietaryRestrictions: [],
        ...resident.medicalInfo,
        ...info,
      }
      return builder
    },

    withAllergies(...allergies: string[]) {
      resident.medicalInfo ??= {
        allergies: [],
        chronicConditions: [],
        medications: [],
        dietaryRestrictions: [],
      };
      resident.medicalInfo.allergies = [
        ...(resident.medicalInfo.allergies || []),
        ...allergies,
      ]
      return builder
    },

    withChronicConditions(...conditions: string[]) {
      resident.medicalInfo ??= {
        allergies: [],
        chronicConditions: [],
        medications: [],
        dietaryRestrictions: [],
      };
      resident.medicalInfo.chronicConditions = [
        ...(resident.medicalInfo.chronicConditions || []),
        ...conditions,
      ]
      return builder
    },

    withEmergencyContacts(contacts: Resident['emergencyContacts']) {
      resident.emergencyContacts = contacts
      return builder
    },

    withEmergencyContact(contact: Resident['emergencyContacts'][0]) {
      resident.emergencyContacts ??= [];
      resident.emergencyContacts = [
        ...resident.emergencyContacts,
        contact,
      ]
      return builder
    },

    withAssignedCaregivers(...caregiverIds: string[]) {
      resident.assignedCaregivers = caregiverIds
      return builder
    },

    withTimestamps(createdAt: Date, updatedAt: Date) {
      resident.createdAt = createdAt
      resident.updatedAt = updatedAt
      return builder
    },

    build(overrides?: Partial<Resident>): Resident {
      const now = new Date()
      const defaultDateOfBirth = new Date(now.getFullYear() - 75, 0, 1)

      return {
        id: resident.id || faker.string.uuid(),
        firstName: resident.firstName || faker.person.firstName(),
        lastName: resident.lastName || faker.person.lastName(),
        dateOfBirth: resident.dateOfBirth || defaultDateOfBirth,
        photoURL: resident.photoURL,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
          ...resident.medicalInfo,
        },
        emergencyContacts:
          resident.emergencyContacts || [
            {
              name: faker.person.fullName(),
              relationship: faker.helpers.arrayElement([
                'Hija',
                'Hijo',
                'Cónyuge',
                'Hermano',
                'Hermana',
              ]),
              phone: faker.phone.number({ style: 'national' }),
              email: faker.internet.email(),
            },
          ],
        assignedCaregivers: resident.assignedCaregivers || [],
        createdAt: resident.createdAt || now,
        updatedAt: resident.updatedAt || now,
        ...overrides,
      }
    },
  }

  return builder
}

/**
 * Create multiple residents
 */
export function createManyResidents(
  count: number,
  overrides?: Partial<Resident>
): Resident[] {
  return Array.from({ length: count }, () =>
    createResidentFactory({
      ...overrides,
      id: overrides?.id ?? faker.string.uuid(),
    })
      .withName(
        overrides?.firstName || faker.person.firstName(),
        overrides?.lastName || faker.person.lastName()
      )
      .build()
  )
}

/**
 * Legacy object-style API for backwards compatibility.
 * Use createResidentFactory() directly instead.
 */
export const ResidentFactory = {
  create: createResidentFactory,
  createMany: createManyResidents,
}

/**
 * Legacy function for backwards compatibility.
 * @deprecated Use createResidentFactory().build() instead
 */
export function createTestResident(
  overrides?: Partial<Resident>
): Resident {
  return createResidentFactory(overrides).build()
}

/**
 * Legacy function for backwards compatibility.
 * @deprecated Use createManyResidents() instead
 */
export function createTestResidents(
  count: number,
  overrides?: Partial<Resident>
): Resident[] {
  return createManyResidents(count, overrides)
}
