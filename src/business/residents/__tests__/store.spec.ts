import { createPinia,setActivePinia } from 'pinia'
import { beforeEach,describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { createTestResident } from '@/test/helpers/residents'

import { createResidentRepository } from '../infrastructure'
import { useResidentStore } from '../store'

vi.mock('../infrastructure', () => ({
  createResidentRepository: vi.fn(),
}))

describe('Resident Store', () => {
  let mockRepository: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByCaregiver: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    
    vi.mocked(createResidentRepository).mockReturnValue(mockRepository)
  })

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const store = useResidentStore()
      
      expect(store.residents).toEqual([])
      expect(store.currentResident).toBeNull()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('fetchResidents', () => {
    it('should load residents into store', async () => {
      const testResidents = [
        createTestResident({ id: 'resident-1' }),
        createTestResident({ id: 'resident-2' }),
      ]

      mockRepository.findByCaregiver.mockResolvedValue({
        success: true,
        value: testResidents,
      })

      const store = useResidentStore()
      await store.fetchResidents('caregiver-1')

      expect(store.residents).toHaveLength(2)
      expect(store.residents[0]?.id).toBe('resident-1')
    })

    it('should set loading state during fetch', async () => {
      mockRepository.findByCaregiver.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, value: [] }), 100))
      )

      const store = useResidentStore()
      const fetchPromise = store.fetchResidents('caregiver-1')

      expect(store.isLoading).toBe(true)
      await fetchPromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('fetchResident', () => {
    it('should load a single resident', async () => {
      const testResident = createTestResident({ id: 'resident-1' })

      mockRepository.findById.mockResolvedValue({
        success: true,
        value: testResident,
      })

      const store = useResidentStore()
      await store.fetchResident('resident-1')

      expect(store.currentResident?.id).toBe('resident-1')
    })
  })

  describe('getters', () => {
    it('should get resident by ID', () => {
      const store = useResidentStore()
      const testResidents = [
        createTestResident({ id: 'resident-1' }),
        createTestResident({ id: 'resident-2' }),
      ]

      store.residents = testResidents

      const resident = store.residentById('resident-1')
      expect(resident?.id).toBe('resident-1')
    })

    it('should get residents by caregiver', () => {
      const store = useResidentStore()
      const testResidents = [
        createTestResident({ id: 'resident-1', assignedCaregivers: ['caregiver-1'] }),
        createTestResident({ id: 'resident-2', assignedCaregivers: ['caregiver-2'] }),
      ]

      store.residents = testResidents

      const residents = store.residentsByCaregiver('caregiver-1')
      expect(residents).toHaveLength(1)
      expect(residents[0]?.id).toBe('resident-1')
    })
  })
})

