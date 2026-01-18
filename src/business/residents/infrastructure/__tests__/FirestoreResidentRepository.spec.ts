import { beforeEach,describe, expect, it } from 'vitest'

import { createTestResident } from '@/test/helpers/residents'
import { testDb } from '@/test/setup'

import type { ResidentRepository } from '../../domain/ResidentRepository'
import { createResidentRepository } from '../FirestoreResidentRepository'

describe('FirestoreResidentRepository', () => {
  let repository: ResidentRepository

  beforeEach(() => {
    repository = createResidentRepository(testDb)
  })

  describe('create', () => {
    it('should create a resident in Firestore', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      const now = new Date()
      
      const residentData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: ['caregiver-1'],
      }

      const result = await repository.create(residentData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.id).toBeDefined()
        expect(result.value.firstName).toBe('Juan')
        expect(result.value.lastName).toBe('Pérez')
        expect(result.value.createdAt).toBeInstanceOf(Date)
        expect(result.value.updatedAt).toBeInstanceOf(Date)
      }
    })
  })

  describe('findById', () => {
    it('should find a resident by ID', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      const now = new Date()
      
      const residentData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      const createResult = await repository.create(residentData)
      expect(createResult.success).toBe(true)

      if (createResult.success) {
        const findResult = await repository.findById(createResult.value.id)
        expect(findResult.success).toBe(true)
        if (findResult.success) {
          expect(findResult.value).not.toBeNull()
          if (findResult.value) {
            expect(findResult.value.id).toBe(createResult.value.id)
            expect(findResult.value.firstName).toBe('Juan')
          }
        }
      }
    })

    it('should return null if resident not found', async () => {
      const result = await repository.findById('non-existent-id')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeNull()
      }
    })
  })

  describe('findAll', () => {
    it('should find all residents', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      
      const resident1 = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      const resident2 = {
        firstName: 'María',
        lastName: 'García',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      await repository.create(resident1)
      await repository.create(resident2)

      const result = await repository.findAll()
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.length).toBeGreaterThanOrEqual(2)
      }
    })
  })

  describe('findByCaregiver', () => {
    it('should find residents assigned to a caregiver', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      
      const resident1 = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: ['caregiver-1'],
      }

      const resident2 = {
        firstName: 'María',
        lastName: 'García',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: ['caregiver-2'],
      }

      await repository.create(resident1)
      await repository.create(resident2)

      const result = await repository.findByCaregiver('caregiver-1')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.length).toBe(1)
        expect(result.value[0]?.assignedCaregivers).toContain('caregiver-1')
      }
    })
  })

  describe('update', () => {
    it('should update an existing resident', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      
      const residentData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      const createResult = await repository.create(residentData)
      expect(createResult.success).toBe(true)

      if (createResult.success) {
        const updateResult = await repository.update(createResult.value.id, {
          firstName: 'Juan Carlos',
        })

        expect(updateResult.success).toBe(true)
        if (updateResult.success) {
          expect(updateResult.value.firstName).toBe('Juan Carlos')
          expect(updateResult.value.lastName).toBe('Pérez')
        }
      }
    })
  })

  describe('delete', () => {
    it('should delete a resident', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      
      const residentData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      const createResult = await repository.create(residentData)
      expect(createResult.success).toBe(true)

      if (createResult.success) {
        const deleteResult = await repository.delete(createResult.value.id)
        expect(deleteResult.success).toBe(true)

        const findResult = await repository.findById(createResult.value.id)
        expect(findResult.success).toBe(true)
        if (findResult.success) {
          expect(findResult.value).toBeNull()
        }
      }
    })
  })

  describe('search', () => {
    it('should search residents by first name', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      
      const resident1 = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      const resident2 = {
        firstName: 'María',
        lastName: 'García',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      await repository.create(resident1)
      await repository.create(resident2)

      const result = await repository.search('Juan')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.length).toBeGreaterThanOrEqual(1)
        expect(result.value.some(r => r.firstName === 'Juan')).toBe(true)
      }
    })

    it('should search residents by last name', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      
      const resident1 = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      await repository.create(resident1)

      const result = await repository.search('Pérez')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.length).toBeGreaterThanOrEqual(1)
        expect(result.value.some(r => r.lastName === 'Pérez')).toBe(true)
      }
    })

    it('should be case-insensitive', async () => {
      const dateOfBirth = new Date(1950, 0, 1)
      
      const resident1 = {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth,
        medicalInfo: {
          allergies: [],
          chronicConditions: [],
          medications: [],
          dietaryRestrictions: [],
        },
        emergencyContacts: [],
        assignedCaregivers: [],
      }

      await repository.create(resident1)

      const result = await repository.search('juan')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.length).toBeGreaterThanOrEqual(1)
      }
    })
  })
})

