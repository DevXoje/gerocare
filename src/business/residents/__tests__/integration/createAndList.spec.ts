import { describe, it, expect, beforeEach } from 'vitest'
import { testDb } from '@/test/setup'
import { createResidentRepository } from '../../infrastructure/FirestoreResidentRepository'
import type { ResidentRepository } from '../../domain/ResidentRepository'
import { createTestResident } from '@/test/helpers/residents'

describe('Resident Integration: Create and List', () => {
  let repository: ResidentRepository

  beforeEach(() => {
    repository = createResidentRepository(testDb)
  })

  it('should create a resident and it appears in the list', async () => {
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
      assignedCaregivers: ['caregiver-1'],
    }

    const createResult = await repository.create(residentData)
    expect(createResult.success).toBe(true)

    if (createResult.success) {
      const findAllResult = await repository.findAll()
      expect(findAllResult.success).toBe(true)
      
      if (findAllResult.success) {
        const found = findAllResult.value.find(r => r.id === createResult.value.id)
        expect(found).toBeDefined()
        expect(found?.firstName).toBe('Juan')
      }
    }
  })

  it('should create a resident and it can be searched', async () => {
    const dateOfBirth = new Date(1950, 0, 1)
    
    const residentData = {
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
      assignedCaregivers: ['caregiver-1'],
    }

    const createResult = await repository.create(residentData)
    expect(createResult.success).toBe(true)

    if (createResult.success) {
      const searchResult = await repository.search('María')
      expect(searchResult.success).toBe(true)
      
      if (searchResult.success) {
        expect(searchResult.value.length).toBeGreaterThan(0)
        expect(searchResult.value.some(r => r.firstName === 'María')).toBe(true)
      }
    }
  })

  it('should create a resident and it can be accessed by ID', async () => {
    const dateOfBirth = new Date(1950, 0, 1)
    
    const residentData = {
      firstName: 'Carlos',
      lastName: 'López',
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

    const createResult = await repository.create(residentData)
    expect(createResult.success).toBe(true)

    if (createResult.success) {
      const findResult = await repository.findById(createResult.value.id)
      expect(findResult.success).toBe(true)
      
      if (findResult.success && findResult.value) {
        expect(findResult.value.id).toBe(createResult.value.id)
        expect(findResult.value.firstName).toBe('Carlos')
      }
    }
  })
})

