import type { ActivityLog } from '@/business/activity-logs/domain/ActivityLog'
import type { ActivityLogError } from '@/business/activity-logs/domain/ActivityLogErrors'
import type { Result } from '@/shared/domain/Result'

export interface ActivityLogRepository {
	create(
		activityLog: Omit<ActivityLog, 'id' | 'createdAt'>
	): Promise<Result<ActivityLog, ActivityLogError>>
	findById(id: string): Promise<Result<ActivityLog | null, ActivityLogError>>
	findByResident(residentId: string): Promise<Result<ActivityLog[], ActivityLogError>>
	findByCaregiver(caregiverId: string): Promise<Result<ActivityLog[], ActivityLogError>>
	findByResidentAndDateRange(
		residentId: string,
		startDate: Date,
		endDate: Date
	): Promise<Result<ActivityLog[], ActivityLogError>>
	findAll(): Promise<Result<ActivityLog[], ActivityLogError>>
	update(
		id: string,
		updates: Partial<Omit<ActivityLog, 'id' | 'createdAt'>>
	): Promise<Result<ActivityLog, ActivityLogError>>
	delete(id: string): Promise<Result<void, ActivityLogError>>
}
