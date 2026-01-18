import { createActivityLogRepository } from '@/business/activity-logs/infrastructure'

/**
 * Limpia todos los registros de actividad de la base de datos
 */
export async function clearActivityLogs(): Promise<number> {
	const repository = createActivityLogRepository()
	let deletedCount = 0

	const result = await repository.findAll()

	if (result.success) {
		for (const activityLog of result.value) {
			const deleteResult = await repository.delete(activityLog.id)
			if (deleteResult.success) {
				deletedCount++
			} else {
				console.error(
					`✗ Error al eliminar registro de actividad ${activityLog.id}: ${deleteResult.error.message}`
				)
			}
		}
		console.log(`✓ ${deletedCount} registros de actividad eliminados`)
	} else {
		console.error(`✗ Error al obtener registros de actividad: ${result.error.message}`)
	}

	return deletedCount
}
