import type { Resident } from '@/business/residents/domain/Resident'
import type { ResidentError } from '@/business/residents/domain/ResidentErrors'
import type { Result } from '@/shared/domain/Result'

export interface ResidentRepository {
	/**
	 * Create a new resident
	 */
	create(
		resident: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Result<Resident, ResidentError>>

	/**
	 * Find a resident by ID
	 */
	findById(id: string): Promise<Result<Resident | null, ResidentError>>

	/**
	 * Find all residents
	 */
	findAll(): Promise<Result<Resident[], ResidentError>>

	/**
	 * Find residents assigned to a specific caregiver
	 */
	findByCaregiver(caregiverId: string): Promise<Result<Resident[], ResidentError>>

	/**
	 * Update an existing resident
	 */
	update(
		id: string,
		updates: Partial<Omit<Resident, 'id' | 'createdAt'>>
	): Promise<Result<Resident, ResidentError>>

	/**
	 * Delete a resident
	 */
	delete(id: string): Promise<Result<void, ResidentError>>

	/**
	 * Search residents by name (first name or last name)
	 */
	search(query: string): Promise<Result<Resident[], ResidentError>>
}
