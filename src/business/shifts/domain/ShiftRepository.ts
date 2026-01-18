import type { Shift } from '@/business/shifts/domain/Shift'
import type { ShiftError } from '@/business/shifts/domain/ShiftErrors'
import type { Result } from '@/shared/domain/Result'

export interface ShiftRepository {
	/**
	 * Create a new shift
	 */
	create(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Shift, ShiftError>>

	/**
	 * Find a shift by ID
	 */
	findById(id: string): Promise<Result<Shift | null, ShiftError>>

	/**
	 * Find all shifts for a caregiver
	 */
	findByCaregiver(caregiverId: string): Promise<Result<Shift[], ShiftError>>

	/**
	 * Find all shifts for a date range
	 */
	findByDateRange(startDate: Date, endDate: Date): Promise<Result<Shift[], ShiftError>>

	/**
	 * Find all shifts for a specific date
	 */
	findByDate(date: Date): Promise<Result<Shift[], ShiftError>>

	/**
	 * Find all shifts
	 */
	findAll(): Promise<Result<Shift[], ShiftError>>

	/**
	 * Update an existing shift
	 */
	update(
		id: string,
		updates: Partial<Omit<Shift, 'id' | 'createdAt'>>
	): Promise<Result<Shift, ShiftError>>

	/**
	 * Delete a shift
	 */
	delete(id: string): Promise<Result<void, ShiftError>>
}
