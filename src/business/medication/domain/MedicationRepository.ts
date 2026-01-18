import type { Medication, MedicationAdministration } from '@/business/medication/domain/Medication'
import type { MedicationError } from '@/business/medication/domain/MedicationErrors'
import type { Result } from '@/shared/domain/Result'

export interface MedicationRepository {
	/**
	 * Create a new medication prescription
	 */
	create(
		medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Result<Medication, MedicationError>>

	/**
	 * Find a medication by ID
	 */
	findById(id: string): Promise<Result<Medication | null, MedicationError>>

	/**
	 * Find all medications for a resident
	 */
	findByResident(residentId: string): Promise<Result<Medication[], MedicationError>>

	/**
	 * Find all medications
	 */
	findAll(): Promise<Result<Medication[], MedicationError>>

	/**
	 * Update an existing medication
	 */
	update(
		id: string,
		updates: Partial<Omit<Medication, 'id' | 'createdAt'>>
	): Promise<Result<Medication, MedicationError>>

	/**
	 * Delete a medication
	 */
	delete(id: string): Promise<Result<void, MedicationError>>

	/**
	 * Record medication administration
	 */
	recordAdministration(
		administration: Omit<MedicationAdministration, 'id'>
	): Promise<Result<MedicationAdministration, MedicationError>>

	/**
	 * Get administration history for a medication
	 */
	getAdministrationHistory(
		medicationId: string
	): Promise<Result<MedicationAdministration[], MedicationError>>

	/**
	 * Get administration history for a resident
	 */
	getResidentAdministrationHistory(
		residentId: string
	): Promise<Result<MedicationAdministration[], MedicationError>>
}
