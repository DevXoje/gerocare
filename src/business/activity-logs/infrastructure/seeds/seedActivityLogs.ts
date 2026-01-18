import { faker } from '@faker-js/faker'

import type { ActivityLog } from '@/business/activity-logs/domain/ActivityLog'
import { createActivityLogRepository } from '@/business/activity-logs/infrastructure'

export interface SeedActivityLog {
	activityLog: ActivityLog
}

/**
 * Genera registros de actividad de prueba para desarrollo
 */
export async function seedActivityLogs(
	residentIds: string[],
	caregiverIds: string[] = [],
	days: number = 7
): Promise<SeedActivityLog[]> {
	const repository = createActivityLogRepository()
	const created: SeedActivityLog[] = []

	const activityTypes: ActivityLog['activityType'][] = [
		'hygiene',
		'mobility',
		'nutrition',
		'medication',
		'social',
		'other',
	]

	const today = new Date()

	for (let day = 0; day < days; day++) {
		const date = new Date(today)
		date.setDate(today.getDate() - day)

		for (const residentId of residentIds) {
			// Crear 2-5 actividades por residente por día
			const count = faker.number.int({ min: 2, max: 5 })

			for (let i = 0; i < count; i++) {
				const activityType = faker.helpers.arrayElement(activityTypes)
				const timestamp = new Date(date)
				timestamp.setHours(
					faker.number.int({ min: 8, max: 20 }),
					faker.number.int({ min: 0, max: 59 }),
					0
				)

				const activityLogData: Omit<ActivityLog, 'id' | 'createdAt'> = {
					residentId,
					caregiverId: caregiverIds.length > 0 ? faker.helpers.arrayElement(caregiverIds) : '',
					activityType,
					title: faker.lorem.sentence({ min: 3, max: 6 }),
					description: faker.lorem.paragraph(),
					timestamp,
					duration: faker.helpers.maybe(() => faker.number.int({ min: 15, max: 120 }), {
						probability: 0.7,
					}),
					notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
					status: faker.helpers.arrayElement(['completed', 'partial', 'skipped'] as const),
				}

				const result = await repository.create(activityLogData)

				if (result.success) {
					created.push({ activityLog: result.value })
				} else {
					console.error(
						`✗ Error al crear registro de actividad: ${result.error.message || 'Error desconocido'}`
					)
				}
			}
		}
	}

	console.log(`✓ ${created.length} registros de actividad creados para los últimos ${days} días`)
	return created
}
