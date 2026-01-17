/**
 * Centralized exports for test factories
 */

export {
  createResidentFactory,
  createManyResidents,
  ResidentFactory, // Legacy compatibility
  createTestResident, // Legacy compatibility
  createTestResidents, // Legacy compatibility
  type ResidentFactoryBuilder,
} from './ResidentFactory'

export {
  createUserFactory,
  UserFactory, // Legacy compatibility
  createTestUser, // Legacy compatibility
  type UserFactoryBuilder,
} from './UserFactory'
