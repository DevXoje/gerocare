import { CarePlanSchema } from '@/business/care-plans/domain/CarePlan.schema'
import type { CarePlanError } from '@/business/care-plans/domain/CarePlanErrors'
import { createCarePlanValidationError } from '@/business/care-plans/domain/CarePlanErrors'
import { Err, Ok, type Result } from '@/shared/domain/Result'

export interface CarePlan {
	id: string
	residentId: string
	title: string
	description: string
	category: 'hygiene' | 'nutrition' | 'mobility' | 'social' | 'medical' | 'cognitive'
	frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as-needed'
	priority: 'low' | 'medium' | 'high' | 'urgent'
	startDate: Date
	endDate?: Date
	status: 'active' | 'paused' | 'completed' | 'cancelled'
	createdBy: string // User ID
	assignedTo?: string[] // User IDs
	createdAt: Date
	updatedAt: Date
}

export interface CarePlanActivity {
	id: string
	carePlanId: string
	residentId: string
	activityDate: Date
	completedBy?: string // User ID
	completedAt?: Date
	notes?: string
	status: 'pending' | 'completed' | 'skipped'
}

/**
 * Validate a care plan entity using Zod schema
 */
export function validateCarePlan(carePlan: unknown): Result<CarePlan, CarePlanError> {
	const result = CarePlanSchema.safeParse(carePlan)

	if (!result.success) {
		const firstError = result.error.issues[0]
		return Err(createCarePlanValidationError(firstError?.message || 'Validation failed'))
	}

	return Ok(result.data)
}

/**
 * Check if care plan is currently active
 */
export function isCarePlanActive(carePlan: CarePlan, date: Date = new Date()): boolean {
	if (carePlan.status !== 'active') {
		return false
	}

	if (date < carePlan.startDate) {
		return false
	}

	if (carePlan.endDate && date > carePlan.endDate) {
		return false
	}

	return true
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: CarePlan['category']): string {
	const names: Record<CarePlan['category'], string> = {
		hygiene: 'Higiene',
		nutrition: 'Nutrición',
		mobility: 'Movilidad',
		social: 'Social',
		medical: 'Médico',
		cognitive: 'Cognitivo',
	}
	return names[category]
}
