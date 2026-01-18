import { ActivityLogSchema } from '@/business/activity-logs/domain/ActivityLog.schema'
import type { ActivityLogError } from '@/business/activity-logs/domain/ActivityLogErrors'
import { createActivityLogValidationError } from '@/business/activity-logs/domain/ActivityLogErrors'
import { Err, Ok, type Result } from '@/shared/domain/Result'

export interface ActivityLog {
	id: string
	residentId: string
	caregiverId: string // User ID
	activityType: 'hygiene' | 'mobility' | 'nutrition' | 'medication' | 'social' | 'other'
	title: string
	description: string
	timestamp: Date
	duration?: number // minutes
	notes?: string
	photos?: string[] // URLs
	status: 'completed' | 'partial' | 'skipped'
	createdAt: Date
}

/**
 * Validate an activity log entity using Zod schema
 */
export function validateActivityLog(activityLog: unknown): Result<ActivityLog, ActivityLogError> {
	const result = ActivityLogSchema.safeParse(activityLog)

	if (!result.success) {
		const firstError = result.error.issues[0]
		return Err(createActivityLogValidationError(firstError?.message || 'Validation failed'))
	}

	return Ok(result.data)
}

/**
 * Get activity type display name
 */
export function getActivityTypeDisplayName(type: ActivityLog['activityType']): string {
	const names: Record<ActivityLog['activityType'], string> = {
		hygiene: 'Higiene',
		mobility: 'Movilidad',
		nutrition: 'Nutrición',
		medication: 'Medicación',
		social: 'Social',
		other: 'Otro',
	}
	return names[type] || type
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: ActivityLog['status']): string {
	const names: Record<ActivityLog['status'], string> = {
		completed: 'Completada',
		partial: 'Parcial',
		skipped: 'Omitida',
	}
	return names[status] || status
}
