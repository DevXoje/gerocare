import type { Result } from '@/shared/domain/Result'

import type { CarePlan, CarePlanActivity } from './CarePlan'
import type { CarePlanError } from './CarePlanErrors'

export interface CarePlanRepository {
  /**
   * Create a new care plan
   */
  create(carePlan: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<CarePlan, CarePlanError>>

  /**
   * Find a care plan by ID
   */
  findById(id: string): Promise<Result<CarePlan | null, CarePlanError>>

  /**
   * Find all care plans for a resident
   */
  findByResident(residentId: string): Promise<Result<CarePlan[], CarePlanError>>

  /**
   * Find all active care plans for a resident
   */
  findActiveByResident(residentId: string): Promise<Result<CarePlan[], CarePlanError>>

  /**
   * Find all care plans
   */
  findAll(): Promise<Result<CarePlan[], CarePlanError>>

  /**
   * Update an existing care plan
   */
  update(id: string, updates: Partial<Omit<CarePlan, 'id' | 'createdAt'>>): Promise<Result<CarePlan, CarePlanError>>

  /**
   * Delete a care plan
   */
  delete(id: string): Promise<Result<void, CarePlanError>>

  /**
   * Record care plan activity completion
   */
  recordActivity(activity: Omit<CarePlanActivity, 'id'>): Promise<Result<CarePlanActivity, CarePlanError>>

  /**
   * Get activity history for a care plan
   */
  getActivityHistory(carePlanId: string): Promise<Result<CarePlanActivity[], CarePlanError>>

  /**
   * Get activity history for a resident
   */
  getResidentActivityHistory(residentId: string): Promise<Result<CarePlanActivity[], CarePlanError>>
}
