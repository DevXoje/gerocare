import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/business/auth/store'
import { createTestResident } from '@/test/helpers/residents'

import { createResidentRepository } from '../../infrastructure'
import { useResidents } from '../useResidents'

// Mock the repository
vi.mock('../../infrastructure', () => ({
  createResidentRepository: vi.fn(),
}))

// Mock vuefire's useCurrentUser
vi.mock('vuefire', async () => {
  const actual = await vi.importActual('vuefire')
  return {
    ...actual,
    useCurrentUser: vi.fn(() => ({ value: { uid: 'caregiver-1', email: 'test@example.com' } })),
  }
})

describe('useResidents', () => {
  let mockRepository: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByCaregiver: vi.fn(),
      search: vi.fn(),
    }
    
    vi.mocked(createResidentRepository).mockReturnValue(mockRepository)
  })

  describe('loadResidents', () => {
    it('should load residents assigned to current user', async () => {
      // useCurrentUser is already mocked at the top level
      const authStore = useAuthStore()

      const testResidents = [
        createTestResident({ id: 'resident-1', assignedCaregivers: ['caregiver-1'] }),
        createTestResident({ id: 'resident-2', assignedCaregivers: ['caregiver-1'] }),
      ]

      mockRepository.findByCaregiver.mockResolvedValue({
        success: true,
        value: testResidents,
      })

      const { residents, loadResidents, isLoading } = useResidents()

      await loadResidents()

      expect(mockRepository.findByCaregiver).toHaveBeenCalledWith('caregiver-1')
      expect(residents.value).toHaveLength(2)
      expect(isLoading.value).toBe(false)
    })

    it('should handle loading state', async () => {
      // useCurrentUser is already mocked at the top level
      const authStore = useAuthStore()

      mockRepository.findByCaregiver.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, value: [] }), 100))
      )

      const { loadResidents, isLoading } = useResidents()

      const loadPromise = loadResidents()
      expect(isLoading.value).toBe(true)

      await loadPromise
      expect(isLoading.value).toBe(false)
    })

    it('should handle errors when loading residents', async () => {
      // useCurrentUser is already mocked at the top level
      const authStore = useAuthStore()

      mockRepository.findByCaregiver.mockResolvedValue({
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: 'Failed to load' },
      })

      const { loadResidents, error } = useResidents()

      await loadResidents()

      expect(error.value).toBeDefined()
    })
  })

  describe('loadResident', () => {
    it('should load a resident by ID', async () => {
      const testResident = createTestResident({ id: 'resident-1' })

      mockRepository.findById.mockResolvedValue({
        success: true,
        value: testResident,
      })

      const { resident, loadResident } = useResidents()

      await loadResident('resident-1')

      expect(mockRepository.findById).toHaveBeenCalledWith('resident-1')
      expect(resident.value?.id).toBe('resident-1')
    })

    it('should handle resident not found', async () => {
      mockRepository.findById.mockResolvedValue({
        success: true,
        value: null,
      })

      const { resident, loadResident } = useResidents()

      await loadResident('non-existent')

      expect(resident.value).toBeNull()
    })
  })

  describe('searchResidents', () => {
    it('should search residents by name', async () => {
      const testResidents = [
        createTestResident({ id: 'resident-1', firstName: 'Juan', lastName: 'Pérez' }),
        createTestResident({ id: 'resident-2', firstName: 'María', lastName: 'García' }),
      ]

      mockRepository.search.mockResolvedValue({
        success: true,
        value: [testResidents[0]],
      })

      const { searchResidents, searchResults } = useResidents()

      await searchResidents('Juan')

      expect(mockRepository.search).toHaveBeenCalledWith('Juan')
      expect(searchResults.value).toHaveLength(1)
      expect(searchResults.value[0]?.firstName).toBe('Juan')
    })

    it('should search residents by last name', async () => {
      const testResidents = [
        createTestResident({ id: 'resident-1', firstName: 'Juan', lastName: 'Pérez' }),
      ]

      mockRepository.search.mockResolvedValue({
        success: true,
        value: testResidents,
      })

      const { searchResidents, searchResults } = useResidents()

      await searchResidents('Pérez')

      expect(mockRepository.search).toHaveBeenCalledWith('Pérez')
      expect(searchResults.value.length).toBeGreaterThan(0)
    })

    it('should be case-insensitive', async () => {
      const testResidents = [
        createTestResident({ id: 'resident-1', firstName: 'Juan', lastName: 'Pérez' }),
      ]

      mockRepository.search.mockResolvedValue({
        success: true,
        value: testResidents,
      })

      const { searchResidents, searchResults } = useResidents()

      await searchResidents('juan')

      expect(searchResults.value.length).toBeGreaterThan(0)
    })
  })
})

